import { ReactNode } from 'react';
import axios, { AxiosError, AxiosRequestHeaders } from 'axios';

// env
import { envValue } from '../../environments/env-value';
import { session } from '../storage/session';

export type AxiosResponseError = AxiosError<{
  message: string;
  errorMessage: string;
}>;

const axiosInstance = axios.create({
  baseURL: `${envValue.value?.ZEPHYR_API_ENDPOINT}`,
});

export function AxiosInterceptor({ children }: { children: ReactNode }) {
  const reqInterceptor = async (config: { headers: AxiosRequestHeaders }) => {
    const token = await session.accessToken;
    // todo: compare to refresh toke and update
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  };

  const errInterceptor = (error: unknown) => Promise.reject(error);

  const interceptor = axiosInstance.interceptors.request.use(
    reqInterceptor,
    errInterceptor,
  );

  axiosInstance.interceptors.response.eject(interceptor);

  return children;
}

export { axiosInstance as axios };
