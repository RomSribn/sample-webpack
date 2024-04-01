import { axios } from '../../utils/axios';
import { useQuery } from '@tanstack/react-query';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export interface GetApplicationTagListParams {
  organization?: string;
  project?: string;
  application?: string;
}

export interface ApplicationTag {
  name: string;
  author: string;
  version: string;
  createdAt: string;
  application_uid: string;
  snapshot_id: string;
  remote_host: string;
  remote_entry_url: string;
}

export const applicationTagQuery = createQueryKeys('application-tag', {
  getApplicationTagList: ({ application_uid }: { application_uid: string | undefined }) => ({
    queryKey: [':', application_uid],
    queryFn: async () => {
      if (!application_uid) {
        return Promise.resolve(undefined);
      }
      const url = `/v2/side-panel/application-tag-list?application_uid=${application_uid}`;
      return axios
        .get<{ entities: ApplicationTag[]; }>(url)
        .then((res) => res.data.entities);
    }
  })
});

export function useApplicationTagList(application_uid: string | undefined) {
  const {
    isLoading,
    data: applicationTagList,
    error
  } = useQuery<ApplicationTag[]>(
    applicationTagQuery.getApplicationTagList({ application_uid }) as never
  );

  return { applicationTagList, isLoading, error };
}
