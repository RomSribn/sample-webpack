function log(obj) {
	console.log(`log ${JSON.stringify(obj)}`);
}

interface Env {
	ze_files: KVNamespace;
	ze_snapshots: KVNamespace;
	ze_tag_snapshot: DurableObject;
}

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		// We assume each Durable Object is mapped to a roomId in a query parameter
		// In a production application, this will likely be a roomId defined by your application
		// that you validate (and/or authenticate) first.
		let url = new URL(req.url);

		// Create (or get) a Durable Object based on that roomId.
		let durableObjectId = env.ze_tag_snapshot.idFromName('latest');
		// Get a "stub" that allows us to call that Durable Object
		let durableObjectStub = env.ze_tag_snapshot.get(durableObjectId);

		// Pass the request to that Durable Object and await the response
		// This invokes the constructor once on your Durable Object class (defined further down)
		// on the first initialization, and the fetch method on each request.
		//
		// We could pass the original Request to the Durable Object's fetch method
		// or a simpler URL with just the roomId.
		// This would return the value we read from KV *within* the Durable Object.
		return await durableObjectStub.fetch(req);

		// return new Response(JSON.stringify(await env.ze_snapshots.get('latest', {type: 'json'})), { status: 200 });
	},
};

export class ZeDurableObject implements DurableObject {
	constructor(state: DurableObjectState, env: Env) {
		// 1. restore state from kv
		this.state = state;
		this.env = env;
		this.state.blockConcurrencyWhile(async () => {
			this.snapshot = await this.state.storage.get('latest');
		});
	}

	// 2. return r2 based on current in-memory snapshot
	async fetch(request: Request) {
		// await this.state.storage.delete('latest');
		const snapTime = Date.now();
		let snapshot = this.snapshot;
		if (!snapshot || (snapshot && snapshot.assetsMap?.length === 0)) {
			snapshot = await this.env.ze_snapshots.get('latest', { type: 'json' });
			if (!snapshot) {
				return new Response('Snapshot Not Found', { status: 404 });
			}

			snapshot.assets = snapshot.assets.map((asset) => {
				let compressed = false;
				const headers = {};
				const pathname = asset.filepath;

				if (pathname.indexOf('.gz') > -1) {
					headers['Content-Encoding'] = 'gzip';
					compressed = true;
				}
				if (pathname.indexOf('.html') > -1) {
					headers['Content-Type'] = 'text/html';
				}
				if (pathname.indexOf('.js') > -1) {
					headers['Content-Type'] = 'application/javascript';
				}
				if (pathname.indexOf('.css') > -1) {
					headers['Content-Type'] = 'text/css';
				}

				return { ...asset, headers, compressed };
			});

			snapshot.assetsMap = snapshot.assets.reduce((map, asset) => {
				map[asset.filepath] = asset;
				return map;
			}, {});

			await this.state.storage.put('latest', snapshot);
		}

		const url = new URL(request.url);
		console.log(`snapshot ${url.pathname} ${Date.now() - snapTime}ms`);
		const pathname = url.pathname === '/' || url.pathname === '' ? 'index.html' : url.pathname.substring(1);

		// const asset = snapshot.assetsMap[`${pathname}.gz`] || snapshot.assetsMap[pathname];
		const asset = snapshot?.assetsMap[pathname];
		if (!asset) {
			return new Response('Asset Not Found', { status: 404 });
		}

		const fileTime = Date.now();
		const file = await this.env.ze_files.get(asset.id, 'stream');
		console.log(`file ${pathname} ${Date.now() - fileTime}ms`);

		const headers = new Headers(asset.headers);
		// headers.set('Content-Length', file.size);

		return new Response(file, {
			status: 200,
			// encodeBody: asset.compressed ? 'manual' : 'automatic',
			headers,
		});
	}
}
