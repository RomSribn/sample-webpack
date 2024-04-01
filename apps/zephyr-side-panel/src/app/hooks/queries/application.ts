import { axios } from '../../utils/axios';
import { useQuery } from '@tanstack/react-query';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export interface Application {
  application_uid: string;
  name: string;
  remote_host: string;
  organization: {
    name: string;
  };
  project: {
    name: string;
  };
}

export const applicationQuery = createQueryKeys('application', {
  getApplicationList: {
    queryKey: null,
    queryFn: () =>
      axios
        .get<{ entities: Application[] }>('/v2/side-panel/application-list')
        .then((res) => res.data.entities),
  },
});

export function useApplicationList() {
  const {
    isLoading,
    data: applicationList,
    error,
    refetch: applicationListRefetch,
  } = useQuery<Application[]>(applicationQuery.getApplicationList as never);

  return { applicationList, isLoading, error, applicationListRefetch };
}
