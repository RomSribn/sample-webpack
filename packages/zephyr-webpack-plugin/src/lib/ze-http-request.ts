import { isDev } from './_debug';
import * as http from 'node:http';
import * as https from 'node:https';

export interface RequestOptions {
  hostname: string;
  port?: number;
  path: string;
  method: string;
  headers?: Record<string, string | number>;
}

export async function request<T = unknown>(
  options: RequestOptions,
  data: unknown,
  forceHttps?: boolean
): Promise<T | string> {
  const _https = !forceHttps && isDev ? http : https;
  return new Promise((resolve, reject) => {
    const req = _https.request(options, (res: http.IncomingMessage) => {
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
