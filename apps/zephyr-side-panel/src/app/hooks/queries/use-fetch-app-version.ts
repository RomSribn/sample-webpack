import {
  useQuery,
  type QueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';

import {
  fetchAppVersion,
  type FetchAppVersionOptions,
} from '../../api-calls/fetch-app-version';
import { ZeAppVersionResponse } from 'zephyr-edge-contract';

export async function prefetchAppVersion(
  queryClient: QueryClient,
  fetchDataOptions: FetchAppVersionOptions,
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ['app-version', fetchDataOptions],
    queryFn: () => fetchAppVersion(fetchDataOptions),
  });
}

export function useFetchAppVersionQuery(
  fetchDataOptions: FetchAppVersionOptions,
  options: Omit<
    UseQueryOptions<ZeAppVersionResponse>,
    'queryKey' | 'queryFn'
  > = {},
) {
  return useQuery<ZeAppVersionResponse>({
    queryKey: ['app-version', fetchDataOptions],
    queryFn: () => fetchAppVersion(fetchDataOptions),
    ...options,
  });
}
