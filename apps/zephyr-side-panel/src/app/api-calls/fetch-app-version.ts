import { fetchJSON } from '../utils/fetch-url';
import { getActiveTabUrl } from '../utils/get-active-tab-url';
import { ZeAppVersion } from 'zephyr-edge-contract';

export type FetchAppVersionOptions = {
  url: string;
};

export type FetchAppVersionResponse = ZeAppVersion | undefined;

export const fetchAppVersion = async ({
  url,
}: FetchAppVersionOptions): Promise<FetchAppVersionResponse> => {
  const activeURL = await getActiveTabUrl(url);

  if (!activeURL) {
    return void 0;
  }

  // request current version of the app
  const _url = new URL(activeURL);
  const res = (await fetchJSON(`${_url.origin}/__app_version`).catch((e) =>
    console.log(e),
  )) as FetchAppVersionResponse;
  console.log(res);
  return res;
};
