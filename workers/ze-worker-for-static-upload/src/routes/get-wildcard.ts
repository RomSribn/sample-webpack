import { Env } from '../index';
import { TagsHeader } from './post-upload-tags';
import { AppendLivereloadHandler } from '../util-attach-livereload';
import { getAppNameFromHostname } from '../utility/util-get-app-name-from-hostname';

// todo: get app name and tag from request?
// const app = 'valorkin-ze-mono-sample-react-app';
const tag = 'latest';

// 1. if have request for root with _ze_id = set cookie to consume some particular snapshot
// 2. if requested file path and _ze_id = return file for a snapshot (just file id would be enough for a start)
// todo: respond with file with one request to kv? prefix(snapshotid) + filepath
// 1. get snapshot id from headers
// 2. get if not snapshot id from cookie choose latest snapshot and set cookie for it
// 3. return file based on snapshot id and file path
// todo: use versioned streams to store snapshots
export async function getWildcard(request: Request, env: Env) {
  const url = new URL(request.url);
  const isRootRequest = url.pathname === '/' || url.pathname === '';
  const pathname = isRootRequest ? 'index.html' : url.pathname.substring(1);
  const app = getAppNameFromHostname(url);

  if (!app) {
    return new Response('App Not Found', { status: 404 });
  }

  const tags = await env.ze_tags.get<TagsHeader>(app, { type: 'json' });

  let snapshot;

  if (!tags) {
    const snap = await env.ze_snapshots.get(app, { type: 'json' });
    if (!snap) {
      return new Response('Snapshot Not Found', { status: 404 });
    }
    snapshot = snap;
  } else {
    snapshot = tags.tags[tag];
  }

  // todo: take in account deploys from windows
  const asset = snapshot.assets[pathname];
  if (!asset) {
    return new Response('Asset Not Found in Snapshot', { status: 404 });
  }

  const headers = new Headers();

  // headers.set('Content-Length', (file.length-1).toString());
  const gzFileAsset = pathname.indexOf('.gz') > -1;
  const encodeBody = gzFileAsset ? 'manual' : 'automatic';

  headers.set('Access-Control-Allow-Origin', '*'); // Adjust the '*' to be more restrictive if necessary
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization');

  // Allow preflight caching for 1 hour (optional)
  headers.set('Access-Control-Max-Age', '3600');

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

  headers.set('x-server', 'zephyr-cloud');

  const file = await env.ze_files.get(asset.hash, 'stream');

  if (file && request.method === 'HEAD') {
    return new Response(null, {
      status: 200,
      headers
    });
  }

  if (!file) {
    return new Response('File Not Found', { status: 404 });
  }

  const livereload = url.searchParams.get('livereload')
  if (isRootRequest && livereload) {
    return new HTMLRewriter()
      .on('body', new AppendLivereloadHandler())
      .transform(new Response(file, request));
  }

  return new Response(file, {
    status: 200,
    encodeBody,
    headers
  });
}
