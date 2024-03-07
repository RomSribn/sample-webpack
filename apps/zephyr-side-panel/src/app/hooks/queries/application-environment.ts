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
    getApplicationEnvironmentList: ({
      organization,
      project,
      application,
    }: GetApplicationEnvironmentListParams) => ({
      queryKey: [':', organization, project, application],
      queryFn: async () => {
        if (!organization || !project || !application)
          return Promise.resolve(undefined);
        return axios
          .get<{
            entities: ApplicationEnvironment[];
          }>(`${organization}/${project}/${application}/application-environment-list`)
          .then((res) => res.data.entities);
      },
    }),
  },
);

export function useApplicatioEnvironmentnList({
  organization,
  project,
  application,
}: GetApplicationEnvironmentListParams) {
  const {
    isLoading,
    data: applicationEnvironmentList,
    error,
  } = useQuery<ApplicationEnvironment[]>(
    applicationEnvironmentQuery.getApplicationEnvironmentList({
      organization,
      project,
      application,
    }) as never,
  );

  return { applicationEnvironmentList, isLoading, error };
}
