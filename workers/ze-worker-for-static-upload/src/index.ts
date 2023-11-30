import { postUploadSnapshot } from './routes/post-upload-snapshot';
import { postUploadFile } from './routes/post-upload-file';
import { getWildcard } from './routes/get-wildcard';
import { postUploadTags } from './routes/post-upload-tags';
import { getListOfApps } from './routes/get-list-of-apps';
import { getAppNameFromHostname } from './utility/util-get-app-name-from-hostname';
import { getListOfAppsJson } from './api/get-list-of-apps-json';
import { getDeploymentDomain } from './utils/get-deployment-domain';
import { getAppVersion } from './routes/get-app-version';

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
      case 'HEAD':
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

        if (url.pathname === '/__app_version') {
          return getAppVersion(request, env);
        }

        if (url.pathname === '/__app_list') {
          return getListOfAppsJson(request, env);
        }

        const regex = /^(edge\.local|(cf|aws)\.valorkin\.dev)/;
        if (regex.test(url.hostname)) {
          return getListOfApps(request, env);
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
