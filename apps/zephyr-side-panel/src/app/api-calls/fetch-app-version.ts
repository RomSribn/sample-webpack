import { getActiveTabUrl } from '../utils/get-active-tab-url';
import { axios } from '../utils/axios';
import { ZeAppVersionResponse } from 'zephyr-edge-contract';

export type FetchAppVersionOptions = {
  url: string;
};

export async function fetchAppVersion({
  url,
}: FetchAppVersionOptions): Promise<ZeAppVersionResponse> {
  const activeURL = await getActiveTabUrl(url);

  // request current version of the app
  return axios
    .get<{
      value: ZeAppVersionResponse;
    }>(
      `/v2/side-panel/application-remote-versions?host_url=${encodeURIComponent(activeURL)}`,
    )
    .then((res) => res.data?.value);
}
