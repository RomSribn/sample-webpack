import { axios } from '../../utils/axios';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export interface GetApplicationVersionListParams {
  application_uid: string | undefined;
  pageParam?: number;
}

export interface GetApplicationVersionListResponse {
  entities: ApplicationVersion[];
  count: number;
}

export interface ApplicationVersion {
  name: string;
  author: string;
  version: string;
  createdAt: string;
  application_uid: string;
  snapshot_id: string;
  remote_host: string;
  remote_entry_url: string;
}

export const applicationVersionQuery = createQueryKeys('application-version', {
  getApplicationVersionList: ({ application_uid, pageParam: page }: GetApplicationVersionListParams) => ({
    queryKey: [':', application_uid],
    queryFn: async () => {
      if (!application_uid) {
        return Promise.resolve(undefined);
      }
      const url = `/v2/side-panel/application-version-list`;
      return axios
        .get<GetApplicationVersionListResponse>(url, { params: { application_uid, page }})
        .then((res) => res.data);
    },
  })
});

export function useApplicationVersionList({ application_uid, pageParam }: GetApplicationVersionListParams) {
  const {
    isLoading,
    data,
    error
  } = useQuery<GetApplicationVersionListResponse>(
    applicationVersionQuery.getApplicationVersionList({ application_uid, pageParam }) as never
  );

  const applicationVersionList = data?.entities;

  return { applicationVersionList, isLoading, error };
}

export function useApplicationVersionListInfinity({ application_uid, pageParam }: GetApplicationVersionListParams) {
  const {
    isLoading,
    data,
    fetchNextPage: fetchNextAppVersionListPage,
    hasNextPage: hasNextAppVersionListPage,
    error,
  } = useInfiniteQuery({
    queryKey: [':', application_uid],
    queryFn: async () => {
      if (!application_uid) {
        return Promise.resolve(undefined);
      }
      const url = `/v2/side-panel/application-version-list`;
      return axios
        .get<GetApplicationVersionListResponse>(url, { params: { application_uid, cursor: pageParam }})
        .then((res) => res.data);
    },
    initialPageParam: 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getNextPageParam: ((lastPage: any) => lastPage?.nextCursor) as never,
  });

  const applicationVersionList = (data?.pages.flatMap((page) => page?.entities) ?? []) as ApplicationVersion[] | undefined;
  const applicationVersionListCount = data?.pages[0]?.count ?? 0;

  return {
    applicationVersionList,
    applicationVersionListCount,
    hasNextAppVersionListPage,
    isLoading,
    fetchNextAppVersionListPage,
    error,
  };
}
