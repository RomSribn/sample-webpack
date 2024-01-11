import { fetchJSON } from '../utils/fetch-url';
import { ApplicationList } from '../containers/application-selector';

// export type FetchAppListOptions = {};

export type FetchAppListResponse = ApplicationList;

export const fetchAppList = async (): Promise<FetchAppListResponse> => {
  return (await fetchJSON('http://edge.local:8787/__app_list').catch(
    () => []
  )) as ApplicationList;
};
