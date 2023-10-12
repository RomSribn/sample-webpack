/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
export interface Env {
  ze_files: R2Bucket;
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  ze_kv: KVNamespace;
  ze_tags: KVNamespace;
  ze_snapshots: KVNamespace;
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const id = url.searchParams.get('id');

    // Route the request based on the HTTP method and action type
    switch (request.method) {
      case 'POST':
        if (type === null) {
          return new Response('Missing type', { status: 400 });
        }

        if (type === 'snapshot') {
          const contentType = request.headers.get('content-type');
          if (!contentType.includes('application/json')) {
            return new Response('Invalid content type', { status: 400 });
          }
          const requestJson = await request.json();
          // 1. we got snapshot object from plugin
          const response = {id: '', assets: [], message: ''};

          // todo: use proper status codes
          const found = await env.ze_snapshots.get(id, {type: 'json'});
          if (found) {
            // 2. if snapshot id in kv and same owner - do nothing
            // todo: this is not possible right now because snap id is based on content
            // todo: get back here where you will have tags and list of versions
            // 3. if snapshot id in kv and different owner - make copy
            // todo: uncomment later
            // return new Response(JSON.stringify(response), { status: 200 });
          }

          // 4. if snapshot id not in kv - create snapshot in kv - hint json type
          // todo: use tags to store versions
          if (id /*&& !found*/) {
            console.log(`deploying snapshot ${id}`)
            await env.ze_snapshots.put(id, JSON.stringify(requestJson));
          }


          if (id && Array.isArray(requestJson.assets)) {
            // 5. check that we have all file hashes in r2 or kv
            const knownFiles = await Promise
              .all(requestJson.assets.map(async (asset) => env.ze_files.head(asset.id)))
            // 6. if all files in bucket - return empty list of hashes
            // 7. if some files not in bucket - return list of hashes to be uploaded
            response.assets = knownFiles
              .map((file, index) => file ? null : requestJson.assets[index])
              .filter(Boolean);

            response.id = id;
            return new Response(JSON.stringify(response), { status: 200 });
          }


          return new Response(JSON.stringify({ assets: [] }), { status: 200 });
        }
        // MAYBE SEPARATE ENDPOINT FOR UPLOADING FILES
        // 1. we get file hash and file content
        // 2. we store file in bucket {[hash]: content}

        if (type === 'file') {
          const contentType = request.headers.get('content-type');
          const fileName = request.headers.get('x-file-path');

          // if (!contentType.includes('application/text')) {
          //   return new Response('Invalid content type', { status: 400 });
          // }
          // todo: check if file exists - do nothing
          const reader = await request.arrayBuffer();
          // const reqText = await request.text();
          // todo: use html and custom tags to store file metadata for response headers and filename
          await env.ze_files.put(id, reader, {metadata: {filename: fileName}})
          return new Response(JSON.stringify({message: `file ${fileName} uploaded`}), {status: 200});
        }

        return new Response('Not Implemented', { status: 501 });
      case 'GET':
        if (url.pathname === '/delete') {
          const allSnaps = await env.ze_snapshots.list();
          allSnaps.keys
            .filter(snap => !!snap?.name)
            .map(async snap => await env.ze_snapshots.delete(snap.name))


          const allFiles = await env.ze_files.list();
          allFiles.objects
            .filter(file => !!file?.key)
            .map(async file => await env.ze_files.delete(file.key));

          return new Response(`Deleted ${allSnaps.keys.length} snapshots and ${allFiles.objects.length} files`, { status: 200 });
        }

        if (url.pathname === '/list') {
          const files = await env.ze_files.list();
          return new Response(JSON.stringify(files), { status: 200 });
        }

        if (url.pathname === '/slist') {
          const list = await env.ze_snapshots.list();
          return new Response(JSON.stringify(list), { status: 200 });
        }

        // 1. if have request for root with _ze_id = set cookie to consume some particular snapshot
        // 2. if requested file path and _ze_id = return file for a snapshot (just file id would be enough for a start)

        // todo: respond with file with one request to kv? prefix(snapshotid) + filepath
        // 1. get snapshot id from headers
        // 2. get if not snapshot id from cookie choose latest snapshot and set cookie for it
        // 3. return file based on snapshot id and file path
        // const list = await env.ze_snapshots.list({limit: 1});
        // if (list?.keys?.length < 1) {
        //   return new Response('Snapshots Not Found', { status: 404 });
        // }
        // const snapshot = await env.ze_snapshots.get(list.keys[0].name, {type: 'json'});
        const snapshot = await env.ze_snapshots.get('latest', {type: 'json'});
        if (!snapshot) {
          return new Response('Snapshot Not Found', { status: 404 });
        }

        const pathname = url.pathname === '/' || url.pathname === ''
          ? 'index.html'
          : url.pathname.substring(1);
        const headers = new Headers();

        const fileAsset = snapshot.assets.find(asset => asset.filepath === pathname);
        const gzFileAsset = snapshot.assets.find(asset => asset.filepath === `${pathname}.gz`);
        const asset = gzFileAsset || fileAsset;
        const file = await env.ze_files.get(asset.id)

        console.log(`serving ${pathname} from ${asset.id} size ${file.size}`)

        headers.set('Content-Length', file.size);
        if (gzFileAsset) {
          headers.set('Content-Encoding', 'gzip');
        }
        if (pathname.indexOf('.html') > -1) {
          headers.set('Content-Type', 'text/html');
        }
        if (pathname.indexOf('.js') > -1) {
          headers.set('Content-Type', 'application/javascript');
        }
        if (pathname.indexOf('.css') > -1) {
          headers.set('Content-Type', 'text/css');
        }

        return new Response(file.body, {
          status: 200,
          encodeBody: gzFileAsset ? "manual" : "automatic",
          headers
        });
      default:
        return new Response('Method Not Allowed', {
          status: 405,
          headers: { Allow: 'POST, GET' }
        });
    }
  }
};
