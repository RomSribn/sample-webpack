import { ApplicationVersion } from '../containers/application-selector';
import { fetchJSON } from '../utils/fetch-url';
import { getActiveTabUrl } from '../utils/get-active-tab-url';

export type FetchAppVersionOptions = {
  url: string;
};

export type FetchAppVersionResponse = ApplicationVersion | undefined;

export const fetchAppVersion = async ({
  url,
}: FetchAppVersionOptions): Promise<FetchAppVersionResponse> => {
  const activeURL = await getActiveTabUrl(url);

  if (!activeURL) {
    return void 0;
  }

  // request current version of the app
  const _url = new URL(activeURL);
  return (await fetchJSON(`${_url.origin}/__app_version`).catch(
    () => void 0
  )) as FetchAppVersionResponse;
};
