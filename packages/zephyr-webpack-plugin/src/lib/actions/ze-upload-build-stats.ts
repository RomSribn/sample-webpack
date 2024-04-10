import {
  ZEPHYR_API_ENDPOINT,
  getToken,
  v2_api_paths,
} from 'zephyr-edge-contract';

export async function zeUploadBuildStats(
  dashData: unknown,
): Promise<void | unknown> {
  const dashboardURL = new URL(
    v2_api_paths.dashboard_path,
    ZEPHYR_API_ENDPOINT,
  );
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
