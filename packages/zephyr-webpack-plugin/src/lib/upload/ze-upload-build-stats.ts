import { getToken } from '../../token/token';
import { telemetry_api_endpoint } from '../../config/endpoints';

// todo: valorkin use edge provider of API endoi
const dashboardURL = telemetry_api_endpoint;
// const dashboardURL = `http://localhost:3333/v2/builder-packages-api/upload-from-dashboard-plugin`;
//const dashboardURL = `https://api-dev.zephyr-cloud.io/v2/builder-packages-api/upload-from-dashboard-plugin`,

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
    id: string;
    // snapshot id
    application_uid: string;
  };
  urls: string[];
}
