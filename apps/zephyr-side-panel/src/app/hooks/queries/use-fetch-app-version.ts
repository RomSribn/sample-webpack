import {
  useQuery,
  type QueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';

import {
  fetchAppVersion,
  type FetchAppVersionResponse,
  type FetchAppVersionOptions,
} from '../../api-calls/fetch-app-version';

export async function prefetchAppVersion(
  queryClient: QueryClient,
  fetchDataOptions: FetchAppVersionOptions
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ['app-version', fetchDataOptions],
    queryFn: () => fetchAppVersion(fetchDataOptions),
  });
}

export function useFetchAppVersionQuery(
  fetchDataOptions: FetchAppVersionOptions,
  options: Omit<
    UseQueryOptions<FetchAppVersionResponse>,
    'queryKey' | 'queryFn'
  > = {}
) {
  return useQuery<FetchAppVersionResponse>({
    queryKey: ['app-version', fetchDataOptions],
    queryFn: () => fetchAppVersion(fetchDataOptions),
    ...options,
  });
}
