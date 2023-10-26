export interface Env {
  ze_files: KVNamespace;
  ze_kv: KVNamespace;
  ze_tags: KVNamespace;
  ze_snapshots: KVNamespace;

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
          if (!id) {
            return new Response('Missing id', { status: 400 });
          }

          const requestJson = await request.json();
          // 1. we got snapshot object from plugin
          const response = { id: '', assets: [], message: '' };

          // todo: use proper status codes
          const found = await env.ze_snapshots.get(id, { type: 'json' });
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
            await env.ze_snapshots.put(id, JSON.stringify(requestJson));
          }


          if (id && Array.isArray(requestJson.assets)) {
            // 5. check that we have all file hashes in r2 or kv
            const knownFiles = await Promise
              .all(requestJson.assets.map(async (asset) => {
                return env.ze_files.get(asset.id)
              }));
            // 6. if all files in bucket - return empty list of hashes
            // 7. if some files not in bucket - return list of hashes to be uploaded
            response.assets = knownFiles
              .map((file, index) => {
                console.log(`${!!file} ${requestJson.assets[index].id}`)
                return file ? null : requestJson.assets[index]
              })
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
          if (!id) {
            return new Response('Missing file id', { status: 400 });
          }
          const contentType = request.headers.get('content-type');
          const fileName = request.headers.get('x-file-path');

          // todo: check if file exists - do nothing
          const reader = await request.arrayBuffer();
          // const reqText = await request.text();
          // todo: use html and custom tags to store file metadata for response headers and filename
          await env.ze_files.put(id, reader, { metadata: { filename: fileName } });
          return new Response(JSON.stringify({ message: `file ${fileName} uploaded` }), { status: 200 });
        }

        return new Response('Not Implemented', { status: 501 });
      case 'GET':
        if (url.pathname === '/delete') {
          let allSnaps;
          let removedSnaps = 0;
          do {
            allSnaps = await env.ze_snapshots.list();
            removedSnaps += allSnaps.keys.length;

            allSnaps?.keys
              ?.filter(snap => !!snap?.name)
              .map(async snap => await env.ze_snapshots.delete(snap.name));
          } while (allSnaps?.keys?.length > 0);

          let allFiles;
          do {
            allFiles = await env.ze_files.list();

            allFiles?.objects
              ?.filter(file => !!file?.key)
              .map(async file => await env.ze_files.delete(file.key));
          } while (allFiles?.objects?.length > 0);


          return new Response(`Deleted ${removedSnaps} snapshots`, { status: 200 });
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

        // todo: use versioned streams to store snapshots
        const snapshot = await env.ze_snapshots.get('latest', { type: 'json' });
        if (!snapshot) {
          return new Response('Snapshot Not Found', { status: 404 });
        }

        const pathname = url.pathname === '/' || url.pathname === ''
          ? 'index.html'
          : url.pathname.substring(1);
        const headers = new Headers();

        const fileAsset = snapshot.assets.find(asset => asset.filepath === pathname);
        // const gzFileAsset = snapshot.assets.find(asset => asset.filepath === `${pathname}.gz`);
        // const asset = gzFileAsset || fileAsset;
        const asset = fileAsset;



        if (!asset) {
          return new Response('Asset Not Found in Snapshot', { status: 404 });
        }

        const {value: file, metadata, cacheStatus} = await env.ze_files.getWithMetadata(asset.id,'stream');

        if (!file) {
          return new Response('File Not Found', { status: 404 });
        }

        // todo: send as file meta from plugin
        // console.log(`serving ${pathname} from ${asset.id} size ${file.length-1}`);
        // headers.set('Content-Length', (file.length-1).toString());
        const encodeBody = gzFileAsset ? 'manual' : 'automatic';
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

        return new Response(file, {
          status: 200,
          encodeBody,
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
