import { isDev } from '../_debug';
import { request, RequestOptions } from '../ze-http-request';
import { ZeBuildAsset } from '../ze-build-assets-map';

interface UploadableAsset {
  path: string;
  extname: string;
  hash: string;
  size: number;
  buffer: Buffer | string;
}

// todo: hardcode
const port = isDev ? 8787 : 443;
const hostname = isDev ? '127.0.0.1' : 'cf.valorkin.dev';

export async function uploadFile(
  id: string,
  asset: UploadableAsset
): Promise<unknown> {
  const type = 'file';
  const meta = {
    path: asset.path,
    extname: asset.extname,
    hash: asset.hash,
    size: asset.size,
    createdAt: Date.now(),
  };

  const options: RequestOptions & { headers: Record<string, string> } = {
    hostname,
    port,
    path: `/upload?type=${type}&id=${id}`,
    method: 'POST',
    headers: {
      // 'Content-Length': asset.buffer.length
    },
  };

  // options.headers['Content-Type'] = 'application/octet';
  options.headers['x-file-path'] = asset.path;
  options.headers['x-file-meta'] = JSON.stringify(meta);

  return request(options, asset.buffer).catch((err) => console.warn(err));
}

export interface SnapshotUploadRes {
  assets: ZeBuildAsset[];
}

export async function uploadSnapshot(
  id: string,
  body: unknown
): Promise<SnapshotUploadRes | undefined> {
  const type = 'snapshot';
  const data = JSON.stringify(body);
  const options: RequestOptions & { headers: Record<string, string> } = {
    hostname,
    port,
    path: `/upload?type=${type}&id=${id}`,
    method: 'POST',
    headers: {
      'Content-Length': data.length.toString(),
    },
  };

  options.headers['Content-Type'] = 'application/json';

  const res = await request<SnapshotUploadRes>(options, data).catch((err) =>
    console.log(err)
  );
  if (!res || typeof res === 'string') {
    console.error(res);
    return;
  }

  return res;
}

export async function uploadTags(id: string, body: unknown): Promise<unknown> {
  const type = 'tag';
  const data = JSON.stringify(body);
  const options: RequestOptions & { headers: Record<string, string> } = {
    hostname,
    port,
    path: `/upload?type=${type}&id=${id}`,
    method: 'POST',
    headers: {
      'Content-Length': data.length.toString(),
    },
  };

  options.headers['Content-Type'] = 'application/json';

  return request(options, data).catch((err) => console.log(err));
}
