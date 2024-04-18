import {
  ZEPHYR_API_ENDPOINT,
  getToken,
  v2_api_paths,
  ZeUploadBuildStats,
} from 'zephyr-edge-contract';

export async function zeUploadBuildStats(
  dashData: unknown
): Promise<{ value: ZeUploadBuildStats } | undefined> {
  const dashboardURL = new URL(
    v2_api_paths.dashboard_path,
    ZEPHYR_API_ENDPOINT
  );
  try {
    const token = await getToken();
    const res = await fetch(dashboardURL, {
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
    console.error(
      `[zephyr]: Error uploading build stats, deployment is not completed`
    );
  }
  return;
}
