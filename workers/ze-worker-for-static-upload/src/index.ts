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

    if (type === null) {
      return new Response('Missing type', { status: 400 });
    }

    // Route the request based on the HTTP method and action type
    switch (request.method) {
      case 'POST':
        if (type === 'snapshot') {
          const contentType = request.headers.get('content-type');
          if (!contentType.includes('application/json')) {
            return new Response('Invalid content type', { status: 400 });
          }
          const requestJson = await request.json();
          // 1. we got snapshot object from plugin
          const response = {assets: [], message: ''};

          // todo: use proper status codes
          const found = await env.ze_snapshots.get(id, {type: 'json'});
          if (found) {
            // 2. if snapshot id in kv and same owner - do nothing
            // todo: this is not possible right now because snap id is based on content
            // todo: get back here where you will have tags and list of versions
            // 3. if snapshot id in kv and different owner - make copy
            // todo: uncomment later
            return new Response(response, { status: 200 });
          }

          // 4. if snapshot id not in kv - create snapshot in kv - hint json type
          if (id && !found) {
            await env.ze_snapshots.put(id, JSON.stringify(requestJson));
          }


          if (Array.isArray(requestJson.assets)) {
            // 5. check that we have all file hashes in r2 or kv
            const knownFiles = await Promise
              .all(requestJson.assets.map(async (hash) => env.ze_files.head(hash)))
            // 6. if all files in bucket - return empty list of hashes
            // 7. if some files not in bucket - return list of hashes to be uploaded
            response.assets = knownFiles
              .map((file, index) => file ? null : requestJson.assets[index])
              .filter(Boolean);
            response.message = `Found ${response.assets.length} files to upload in snapshot ${id}`;
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

          if (!contentType.includes('application/octet')) {
            return new Response('Invalid content type', { status: 400 });
          }
          const requestBuffer = await request.text();
          const str = requestBuffer.toString();
          await env.ze_files.put(id, requestBuffer)
          return new Response(JSON.stringify({message: `file ${fileName} uploaded`}), {status: 200});
        }

        return new Response('Not Implemented', { status: 501 });
      case 'GET':
        // 1. if have request for root with _ze_id = set cookie to consume some particular snapshot
        // 2. if requested file path and _ze_id = return file for a snapshot (just file id would be enough for a start)

        const response = `${request.method} ${url.pathname} ${request.headers.get('content-type')} ${request.headers.get('content-length')}`;
        return new Response(response, { status: 200 });
      default:
        return new Response('Method Not Allowed', {
          status: 405,
          headers: { Allow: 'POST, GET' }
        });
    }
  }
};
