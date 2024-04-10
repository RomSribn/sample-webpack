import * as http from 'node:http';
import * as https from 'node:https';

export interface RequestOptions {
  path: string;
  method: string;
  headers?: Record<string, string | number>;
}

export async function request<T = unknown>(
  _url: string | URL,
  options: RequestOptions,
  data?: unknown,
): Promise<T | string> {
  const url = _url instanceof URL ? _url : new URL(_url);
  const _https = url.protocol !== 'https:' ? http : https;
  return new Promise((resolve, reject) => {
    const req = _https.request(url, options, (res: http.IncomingMessage) => {
      const response: Buffer[] = [];
      res.on('data', (d: Buffer) => response.push(d));

      res.on('end', () => {
        const _response = Buffer.concat(response)?.toString();
        try {
          resolve(JSON.parse(_response));
        } catch {
          resolve(_response);
        }
      });
    });

    req.on('error', (e: unknown) => reject(e));

    if (data) {
      req.write(data);
    }

    req.end();
  });
}
