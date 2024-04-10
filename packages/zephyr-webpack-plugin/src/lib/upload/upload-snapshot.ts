import {
  getApplicationConfiguration,
  getToken,
  Snapshot,
  SnapshotUploadRes,
} from 'zephyr-edge-contract';
import { request, RequestOptions } from '../utils/ze-http-request';

export async function uploadSnapshot({
  body,
  application_uid,
}: {
  body: Snapshot;
  application_uid: string;
}): Promise<SnapshotUploadRes | undefined> {
  const { EDGE_URL, jwt } = await getApplicationConfiguration({
    application_uid,
  });

  const type = 'snapshot';
  const data = JSON.stringify(body);
  const options: RequestOptions & { headers: Record<string, string> } = {
    path: `/upload?type=${type}`,
    method: 'POST',
    headers: {
      'Content-Length': data.length.toString(),
      can_write_jwt: jwt,
    },
  };

  options.headers['Content-Type'] = 'application/json';

  const res = await request<SnapshotUploadRes>(EDGE_URL, options, data);

  if (!res || typeof res === 'string') {
    console.error(res);
    return;
  }

  return res;
}
