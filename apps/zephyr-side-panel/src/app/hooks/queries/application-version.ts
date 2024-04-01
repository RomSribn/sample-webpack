import { axios } from '../../utils/axios';
import { useQuery } from '@tanstack/react-query';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export interface GetApplicationVersionListParams {
  organization?: string;
  project?: string;
  application?: string;
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
  getApplicationVersionList: ({ application_uid }: { application_uid: string | undefined }) => ({
    queryKey: [':', application_uid],
    queryFn: async () => {
      if (!application_uid) {
        return Promise.resolve(undefined);
      }
      const url = `/v2/side-panel/application-version-list?application_uid=${application_uid}`;
      return axios
        .get<{ entities: ApplicationVersion[]; }>(url)
        .then((res) => res.data.entities);
    }
  })
});

export function useApplicationVersionList(application_uid: string | undefined) {
  const {
    isLoading,
    data: applicationVersionList,
    error
  } = useQuery<ApplicationVersion[]>(
    applicationVersionQuery.getApplicationVersionList({ application_uid }) as never
  );

  return { applicationVersionList, isLoading, error };
}
