import { request, RequestOptions } from '../utils/ze-http-request';
import {
  getApplicationConfiguration,
  UploadableAsset,
} from 'zephyr-edge-contract';

export async function uploadFile({
  id,
  asset,
  application_uid,
}: {
  id: string;
  asset: UploadableAsset;
  application_uid: string;
}): Promise<unknown> {
  const type = 'file';
  const meta = {
    path: asset.path,
    extname: asset.extname,
    hash: asset.hash,
    size: asset.size,
    createdAt: Date.now(),
  };

  const { EDGE_URL, jwt } = await getApplicationConfiguration({
    application_uid,
  });

  const options: RequestOptions & { headers: Record<string, string> } = {
    path: `/upload?type=${type}&id=${id}`,
    method: 'POST',
    headers: {
      can_write_jwt: jwt,
    },
  };

  // options.headers['Content-Type'] = 'application/octet';
  options.headers['x-file-path'] = asset.path;
  options.headers['x-file-meta'] = JSON.stringify(meta);

  return request(EDGE_URL, options, asset.buffer);
}
