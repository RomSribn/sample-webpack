import { Env } from '../index';
import { TagsHeader } from '../routes/post-upload-tags';
import { getDeploymentDomain } from '../utils/get-deployment-domain';

export async function mockAllAppData(request: Request, env: Env) {
  const url = new URL(request.url);
  const port = url.port;
  const cursor = url.searchParams.get('cursor');

  const kvList = await getKVList(env, cursor);
  const appList = kvList?.keys
    .map((key) => key.name);

  if (!appList.length) {
    return new Response(JSON.stringify([]), { status: 404 });
  }

  const appData = await Promise.all(appList.map(async (app) =>
    await env.ze_tags.get<TagsHeader>(app, { type: 'json' })));

  if (appData) {
    return new Response(
      JSON.stringify(appData),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    );
  }

  // Generate HTML string with KV pairs
  const json = {
    list: kvList?.keys,
    url: request.url,
    port,
    hostname: getDeploymentDomain(url.hostname),
    cursor: kvList?.list_complete ? '' : kvList?.cursor
  };

  // Return HTML response
  return new Response(JSON.stringify(json), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  });
}

async function getKVList(env: Env, cursor: string | null) {
  return await env.ze_tags.list<TagsHeader>({ limit: 1000, cursor });
}
