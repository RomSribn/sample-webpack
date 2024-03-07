import { postUploadSnapshot } from './routes/post-upload-snapshot';
import { postUploadFile } from './routes/post-upload-file';
import { getWildcard } from './routes/get-wildcard';
import { getUiListOfApps } from './routes/get-ui-list-of-apps';
import { getListOfAppsJson } from './api/get-list-of-apps-json';
import { getAppVersion } from './routes/get-app-version';
import { postUploadEnvs } from './routes/post-upload-envs';
import { Env } from './env';

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
					case 'envs':
						return postUploadEnvs(request, env);
					default:
						return new Response('Not Implemented', { status: 501 });
				}
			case 'HEAD':
			case 'GET':
				if (url.pathname === '/__debug_files_list') {
					const files = await env.ze_files.list();
					return new Response(JSON.stringify(files), { status: 200 });
				}

				if (url.pathname === '/__debug_app_list') {
					const files = await env.ze_app_list.list();
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

				if (url.pathname === '/__my_app_list') {
					return getUiListOfApps(request, env);
				}

				return getWildcard(request, env);
			default:
				return new Response('Method Not Allowed', {
					status: 405,
					headers: { Allow: 'POST, GET' },
				});
		}
	},
};
