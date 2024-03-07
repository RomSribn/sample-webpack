import { axios } from '../../utils/axios';
import { useQuery } from '@tanstack/react-query';
import { createQueryKeys } from '@lukemorales/query-key-factory';

export interface Application {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
}

export const applicationQuery = createQueryKeys('application', {
  getApplicationList: {
    queryKey: null,
    queryFn: () =>
      axios
        .get<{ entities: Application[] }>('/application-list')
        .then((res) => res.data.entities),
  },
});

export function useApplicationList() {
  const {
    isLoading,
    data: applicationList,
    error,
  } = useQuery<Application[]>(applicationQuery.getApplicationList as never);

  return { applicationList, isLoading, error };
}
