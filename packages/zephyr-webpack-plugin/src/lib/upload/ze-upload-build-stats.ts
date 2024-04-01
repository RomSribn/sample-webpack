import { getToken } from 'zephyr-edge-contract';
import { telemetry_api_endpoint } from '../../config/endpoints';

const dashboardURL = telemetry_api_endpoint;

export async function zeUploadBuildStats(
  dashData: unknown,
): Promise<void | unknown> {
  if (!dashboardURL) {
    return Promise.resolve();
  }
  const client = fetch;
  try {
    const token = await getToken();
    const res = await client(dashboardURL, {
      method: 'POST',
      body: JSON.stringify(dashData),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return await res.json();
  } catch (err) {
    console.warn(`Error posting data to dashboard URL: ${dashboardURL}`);
    console.error(err);
  }
  return;
}

export interface ZeUploadBuildStats {
  app_version: {
    application_uid: string;
    // snapshot id
    snapshot_id: string;
  };
  urls: string[];
}
