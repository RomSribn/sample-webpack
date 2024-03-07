import { getZeApp } from '../utils/get-ze-app-from-uri';
import { Env } from '../env';
import { get_app_list } from '../zephyr-api/get-app-list';

function mapAppIdInUrl(url: URL, app_id: string): string {
	const _url = new URL(url);
	_url.host = [app_id, _url.host].join('.');
	_url.pathname = '';
	_url.search = '';
	return _url.toString();
}

export async function getListOfAppsJson(request: Request, env: Env) {
	const url = new URL(request.url);

	const app_list = await get_app_list(env);

	const { domain } = getZeApp(url);

	// Generate HTML string with KV pairs
	const json = {
		list: app_list.keys.map((key) => ({
			name: key.name,
			url: mapAppIdInUrl(url, key.name),
		})),
		origin: url.origin,
		zedomain: domain,
	};

	// Return HTML response
	return new Response(JSON.stringify(json), {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json',
		},
	});
}
