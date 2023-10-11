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
	//
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
    const bucket = env.ze_files;
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    if (type === null) {
      return new Response("Missing type", { status: 400 });
    }

    const contentType = request.headers.get("content-type");
    if (contentType.includes("application/json")) {
      // return new Response(`${JSON.stringify(await request.json())}`);
      return new Response(`${await request.json()}`);
    }

    // Route the request based on the HTTP method and action type
    switch (request.method) {
      case "POST":
        if (type == "snapshot") {
          // 1. we get snapshot object from plugin

          // 2. if snapshot id in kv and same owner - do nothing
          // 3. if snapshot id in kv and different owner - make copy
          // 4. if snapshot id not in kv - create snapshot in kv - hint json type

          // 5. check that we have all file hashes in r2 or kv
          // 6. if all files in bucket - return empty list of hashes
          // 7. if some files not in bucket - return list of hashes to be uploaded
          return new Response(JSON.stringify({hashes: [], bo}), { status: 200 });
        }
        // MAYBE SEPARATE ENDPOINT FOR UPLOADING FILES
        // 1. we get file hash and file content
        // 2. we store file in bucket {[hash]: content}

        return new Response("Not Implemented", { status: 501 });
      case "GET":
        const response = `${request.method} ${url.pathname} ${request.headers.get('content-type')} ${request.headers.get('content-length')}`;
        return new Response(response, { status: 200 });
      default:
        return new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: "POST, GET" }
        });
    }
	},
};
