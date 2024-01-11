import {
  useQuery,
  type QueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';

import {
  fetchAppList,
  type FetchAppListResponse,
} from '../../api-calls/fetch-app-list';

export async function prefetchAppList(queryClient: QueryClient): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: ['app-list'],
    queryFn: () => fetchAppList(),
  });
}

export function useFetchAppListQuery(
  options: Omit<
    UseQueryOptions<FetchAppListResponse>,
    'queryKey' | 'queryFn'
  > = {}
) {
  return useQuery<FetchAppListResponse>({
    queryKey: ['app-list'],
    queryFn: () => fetchAppList(),
    ...options,
  });
}
