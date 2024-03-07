import { axios } from '../../utils/axios';
import { useQuery } from '@tanstack/react-query';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export interface GetApplicationVersionListParams {
  organization?: string;
  project?: string;
  application?: string;
}

export interface ApplicationVersion {
  id: string;
  name: string;
}

export const applicationVersionQuery = createQueryKeys('application-version', {
  getApplicationVersionList: ({
    organization,
    project,
    application,
  }: GetApplicationVersionListParams) => ({
    queryKey: [':', organization, project, application],
    queryFn: async () => {
      if (!organization || !project || !application)
        return Promise.resolve(undefined);
      return axios
        .get<{
          entities: ApplicationVersion[];
        }>(`${organization}/${project}/${application}/application-version-list`)
        .then((res) => res.data.entities);
    },
  }),
});

export function useApplicationVersionList({
  organization,
  project,
  application,
}: GetApplicationVersionListParams) {
  const {
    isLoading,
    data: applicationVersionList,
    error,
  } = useQuery<ApplicationVersion[]>(
    applicationVersionQuery.getApplicationVersionList({
      organization,
      project,
      application,
    }) as never,
  );

  return { applicationVersionList, isLoading, error };
}
