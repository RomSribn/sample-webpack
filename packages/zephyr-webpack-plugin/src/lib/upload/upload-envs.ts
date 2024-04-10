import {
  getApplicationConfiguration,
  ZeUploadBuildStats,
} from 'zephyr-edge-contract';
import { request, RequestOptions } from '../utils/ze-http-request';

export async function uploadEnvs({
  body,
  application_uid,
}: {
  body: ZeUploadBuildStats;
  application_uid: string;
}): Promise<unknown> {
  const type = 'envs';
  const data = JSON.stringify(body);

  const { EDGE_URL, jwt } = await getApplicationConfiguration({
    application_uid,
  });

  const options: RequestOptions & { headers: Record<string, string> } = {
    path: `/upload?type=${type}`,
    method: 'POST',
    headers: {
      can_write_jwt: jwt,
      'Content-Length': data.length.toString(),
    },
  };

  options.headers['Content-Type'] = 'application/json';

  return request(EDGE_URL, options, data);
}
