import { edge_endpoint } from '../../config/endpoints';
import { request, RequestOptions } from '../utils/ze-http-request';
import {
  Snapshot,
  SnapshotUploadRes,
  UploadableAsset,
  ZeEnvs,
} from 'zephyr-edge-contract';

const { hostname, port } = edge_endpoint;

export async function uploadFile(
  id: string,
  asset: UploadableAsset,
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

  return request(options, asset.buffer);
}

export async function uploadSnapshot(
  body: Snapshot,
): Promise<SnapshotUploadRes | undefined> {
  const type = 'snapshot';
  const data = JSON.stringify(body);
  const options: RequestOptions & { headers: Record<string, string> } = {
    hostname,
    port,
    path: `/upload?type=${type}`,
    method: 'POST',
    headers: {
      'Content-Length': data.length.toString(),
    },
  };

  options.headers['Content-Type'] = 'application/json';

  const res = await request<SnapshotUploadRes>(options, data);

  if (!res || typeof res === 'string') {
    console.error(res);
    return;
  }

  return res;
}

export async function uploadEnvs(body: ZeEnvs): Promise<unknown> {
  const type = 'envs';
  const data = JSON.stringify(body);
  const options: RequestOptions & { headers: Record<string, string> } = {
    hostname,
    port,
    path: `/upload?type=${type}`,
    method: 'POST',
    headers: {
      'Content-Length': data.length.toString(),
    },
  };

  options.headers['Content-Type'] = 'application/json';

  return request(options, data);
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

  return request(options, data);
}
