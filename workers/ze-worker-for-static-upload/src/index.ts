import { postUploadSnapshot } from './routes/post-upload-snapshot';
import { postUploadFile } from './routes/post-upload-file';
import { getWildcard } from './routes/get-wildcard';
import { postUploadTags } from './routes/post-upload-tags';

export interface Env {
  ze_tags: KVNamespace;
  ze_snapshots: KVNamespace;
  ze_files: KVNamespace;
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    // Route the request based on the HTTP method and action type
    switch (request.method) {
      case 'POST':
        switch (type) {
          case 'snapshot':
            return postUploadSnapshot(request, env);
          case 'file':
            return postUploadFile(request, env);
          case 'tag':
            return postUploadTags(request, env);
          default:
            return new Response('Not Implemented', { status: 501 });
        }
      case 'GET':
        if (url.pathname === '/__debug_files_list') {
          const files = await env.ze_files.list();
          return new Response(JSON.stringify(files), { status: 200 });
        }

        if (url.pathname === '/__debug_tags_list') {
          const files = await env.ze_tags.list();
          return new Response(JSON.stringify(files), { status: 200 });
        }

        if (url.pathname === '/__debug_snapshots_list') {
          const list = await env.ze_snapshots.list();
          return new Response(JSON.stringify(list), { status: 200 });
        }

        return getWildcard(request, env);
      default:
        return new Response('Method Not Allowed', {
          status: 405,
          headers: { Allow: 'POST, GET' }
        });
    }
  }
};
