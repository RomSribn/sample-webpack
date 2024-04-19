import type { ClientRequestArgs } from 'node:http';
import { getApplicationConfiguration, request, ze_log, ZeUploadBuildStats } from 'zephyr-edge-contract';

export async function uploadEnvs({
                                   body,
                                   application_uid,
                                 }: {
  body: ZeUploadBuildStats;
  application_uid: string;
}): Promise<unknown> {
  ze_log(`Uploading envs to Zephyr, for ${application_uid}`);
  const type = 'envs';
  const data = JSON.stringify(body);

  const { EDGE_URL, jwt } = await getApplicationConfiguration({
    application_uid,
  });

  const url = new URL('/upload', EDGE_URL);
  url.searchParams.append('type', type);
  const options: ClientRequestArgs = {
    method: 'POST',
    headers: {
      can_write_jwt: jwt,
      'Content-Type': 'application/json',
      'Content-Length': data.length.toString(),
    },
  };

  return request(EDGE_URL, options, data);
}
