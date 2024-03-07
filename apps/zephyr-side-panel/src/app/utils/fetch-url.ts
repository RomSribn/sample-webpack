import { accessToken } from '../auth/refresh-token';

export async function fetchJSON<T = unknown>(
  url: string,
  method?: string,
): Promise<T> {
  const config = {
    method: method ?? 'GET',
    headers: {
      Authorization: 'Bearer ' + accessToken(),
    },
  };
  const response = await fetch(url, config);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  return response.json();
}
