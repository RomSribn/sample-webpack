import { axios } from '../../utils/axios';
import { useQuery } from '@tanstack/react-query';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export interface GetApplicationTagListParams {
  organization?: string;
  project?: string;
  application?: string;
}

export interface ApplicationTag {
  id: string;
  name: string;
}

export const applicationTagQuery = createQueryKeys('application-tag', {
  getApplicationTagList: ({
    organization,
    project,
    application,
  }: GetApplicationTagListParams) => ({
    queryKey: [':', organization, project, application],
    queryFn: async () => {
      if (!organization || !project || !application)
        return Promise.resolve(undefined);
      return axios
        .get<{
          entities: ApplicationTag[];
        }>(`${organization}/${project}/${application}/application-tag-list`)
        .then((res) => res.data.entities);
    },
  }),
});

export function useApplicationTagList({
  organization,
  project,
  application,
}: GetApplicationTagListParams) {
  const {
    isLoading,
    data: applicationTagList,
    error,
  } = useQuery<ApplicationTag[]>(
    applicationTagQuery.getApplicationTagList({
      organization,
      project,
      application,
    }) as never,
  );

  return { applicationTagList, isLoading, error };
}
