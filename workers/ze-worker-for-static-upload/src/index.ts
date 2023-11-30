import { postUploadSnapshot } from './routes/post-upload-snapshot';
import { postUploadFile } from './routes/post-upload-file';
import { getWildcard } from './routes/get-wildcard';
import { postUploadTags } from './routes/post-upload-tags';
import { getListOfApps } from './routes/get-list-of-apps';
import { getAppNameFromHostname } from './utility/util-get-app-name-from-hostname';
import { getListOfAppsJson } from './api/get-list-of-apps-json';
import { mockAllAppData } from './api/mock-application-data';

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
          const app = getAppNameFromHostname(url);
          if (!app) {
            return new Response('App Not Found', { status: 404 });
          }

          const tasks = [];
          if (app.indexOf('_') === -1) {
            tasks.push(env.ze_tags.get(app, { type: 'json' }));
            tasks.push(Promise.resolve({}));
          } else {
            const [app_name, user, version] = app.split('_');
            tasks.push(env.ze_tags.get(app_name, { type: 'json' }));
            tasks.push(env.ze_snapshots.get(app, { type: 'json' }));
          }

          tasks.push(env.ze_snapshots.list({ limit: 100 }));

          const [tag, snap, list] = await Promise.all<any>(tasks);

          // todo: remove assets from tags
          if (tag?.tags) {
            tag.tags = Object.keys(tag.tags)
              .reduce((memo, key) => {
                tag.tags[key].assets = void 0;
                memo[key] = tag.tags[key];
                return memo;
              }, {} as Record<string, any>);
          }

          if (!tag && snap) {
            snap.assets = void 0;
          }

          // version
          const version = snap?.id || tag?.tags['latest']?.id;
          const [app_name, user, build] = version.split('_');
          tag.version = version;
          tag.user = user;
          tag.build = build;
          tag._version = [user, build].join('_');

          tag.snapshot = Object.keys(snap).length ? snap : tag.tags['latest'];
          tag.snapshot.assets = void 0;
          // todo: add versions from list to tags.versions
          // todo: use sorting by creation date
          if (tag?.versions) {
            const _app_name = tag.app;
            const _reg_exp = new RegExp(`^${_app_name}`);
            tag.versions = list.keys
              .filter((key) => _reg_exp.test(key.name))
              .map((key) => key.name)
              .sort((a,b) => a > b ? -1 : 1);
          }

          return new Response(JSON.stringify(tag), {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            status: 200
          });
        }

        if (url.pathname === '/__current_version') {
          const app = getAppNameFromHostname(url);
          if (app) {
            const tag = await env.ze_tags.get(app, { type: 'json' });
            if (tag) {
              return new Response(JSON.stringify(tag), {
                headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Content-Type': 'application/json'
                },
                status: 200
              });
            }

            const snap = await env.ze_snapshots.get(app, { type: 'json' });
            if (!snap) {
              return new Response('Snapshot Not Found', { status: 404 });
            }
            return new Response(JSON.stringify(snap), {
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
              },
              status: 200
            });
          }

        }

        if (url.pathname === '/__app_list') {
          return getListOfAppsJson(request, env);
        }

        if (url.pathname === '/__mock_app_data') {
          return mockAllAppData(request, env);
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
