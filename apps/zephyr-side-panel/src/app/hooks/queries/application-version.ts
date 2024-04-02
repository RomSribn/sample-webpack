import { axios } from '../../utils/axios';
import {
  useInfiniteQuery,
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export interface GetApplicationVersionListParams {
  application_uid: string | undefined;
  /**
   * Initial page param to start the query from.
   * Returns the all data if not provided.
   */
  initialPageParam?: number;
  /**
   * Number of items per page.
   * - 3 by default.
   * - set to `undefined` to get all data if `initialPageParam` is not provided.
   */
  perPage?: number;
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

interface GetApplicationVersionListResponse {
  entities: ApplicationVersion[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

type QueryOptionsType = UseInfiniteQueryOptions<
  GetApplicationVersionListResponse,
  Error,
  InfiniteData<GetApplicationVersionListResponse, number>,
  GetApplicationVersionListResponse,
  QueryKey,
  number | undefined
>;

export const applicationVersionQuery = createQueryKeys('application-version', {
  getApplicationVersionList: ({
    application_uid,
    perPage = 3,
  }: GetApplicationVersionListParams) => ({
    queryKey: [':', application_uid],
    queryFn: async ({ pageParam: page }: { pageParam: number }) => {
      if (!application_uid) {
        return Promise.resolve(undefined);
      }
      const url = `/v2/side-panel/application-version-list`;
      return axios
        .get<GetApplicationVersionListResponse>(url, {
          params: {
            application_uid,
            page,
            perPage: Number.isInteger(page) ? perPage : undefined,
          },
        })
        .then((res) => res.data);
    },
  }),
});

export function useApplicationVersionList({
  application_uid,
  initialPageParam,
  perPage,
}: GetApplicationVersionListParams) {
  const queryOptions: QueryOptionsType = {
    ...applicationVersionQuery.getApplicationVersionList({
      application_uid,
      perPage,
    }),
    initialPageParam,
    getNextPageParam: (...[lastPage, , lastPageParam]) => {
      if (lastPage?.meta.next === null || !lastPageParam) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    getPreviousPageParam: (...[, , firstPageParam]) => {
      if (!firstPageParam || firstPageParam <= 1) {
        return undefined;
      }
      return firstPageParam - 1;
    },
  };
  const {
    isLoading,
    data,
    fetchNextPage: fetchNextAppVersionListPage,
    hasNextPage: hasNextAppVersionListPage,
    error,
  } = useInfiniteQuery(queryOptions);

  const applicationVersionList = data?.pages.flatMap((item) =>
    item?.entities.flat(),
  );
  const applicationVersionListCount = data?.pages[0]?.meta?.total ?? 0;

  return {
    applicationVersionList,
    applicationVersionListCount,
    hasNextAppVersionListPage,
    isLoading,
    fetchNextAppVersionListPage,
    error,
  };
}
