import { Env } from '../index';
import { TagsHeader } from '../routes/post-upload-tags';
import { getDeploymentDomain } from '../utils/get-deployment-domain';

export async function getListOfAppsJson(request: Request, env: Env) {
	const url = new URL(request.url);
	const cursor = url.searchParams.get('cursor');

	const kvList = await getKVList(env, cursor);

	const zedomain = getDeploymentDomain(url.hostname);
	const list = kvList?.keys.map((key) => ({
		name: key.name,
		url: (() => {
			const _url = new URL(request.url);
			_url.hostname = [key.name, zedomain].join('.');
			_url.pathname = '';
			_url.search = '';
			return _url.toString();
		})(),
	}));
	// Generate HTML string with KV pairs
	const json = {
		list,
		origin: url.origin,
		zedomain,
		cursor: kvList?.list_complete ? '' : kvList?.cursor,
	};

	// Return HTML response
	return new Response(JSON.stringify(json), {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json',
		},
	});
}

async function getKVList(env: Env, cursor: string | null) {
	return await env.ze_tags.list<TagsHeader>({ limit: 1000, cursor });
}
