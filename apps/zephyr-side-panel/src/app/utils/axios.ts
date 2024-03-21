import { ReactNode } from 'react';
import axios, { AxiosError, AxiosRequestHeaders } from 'axios';

import { accessToken } from '../auth/refresh-token';
// env
import { envValue } from '../../environments/env-value';

export type AxiosResponseError = AxiosError<{
  message: string;
  errorMessage: string;
}>;

const axiosInstance = axios.create({
  baseURL: `${envValue.value?.ZEPHYR_API_ENDPOINT}/v2/side-panel`,
});

export function AxiosInterceptor({ children }: { children: ReactNode }) {
  const reqInterceptor = async (config: { headers: AxiosRequestHeaders }) => {
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken()}`;
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
export default axiosInstance;
