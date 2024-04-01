import { axios } from '../../utils/axios';
import { useQuery } from '@tanstack/react-query';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export interface GetApplicationEnvironmentListParams {
  organization?: string;
  project?: string;
  application?: string;
}

export interface ApplicationEnvironment {
  id: string;
  name: string;
}

export const applicationEnvironmentQuery = createQueryKeys(
  'application-environment',
  {
    getApplicationEnvironmentList: ({ application_uid }: { application_uid: string | undefined }) => ({
      queryKey: [':', application_uid],
      queryFn: async () => {
        if (!application_uid) {
          return Promise.resolve(undefined);
        }

        const url = `/v2/side-panel/application-environment-list?application_uid=${application_uid}`;
        return axios
          .get<{ entities: ApplicationEnvironment[]; }>(url)
          .then((res) => res.data.entities);
      }
    })
  }
);

export function useApplicatioEnvironmentnList(application_uid: string | undefined) {
  const {
    isLoading,
    data: applicationEnvironmentList,
    error
  } = useQuery<ApplicationEnvironment[]>(
    applicationEnvironmentQuery
      .getApplicationEnvironmentList({ application_uid }) as never
  );

  return { applicationEnvironmentList, isLoading, error };
}
