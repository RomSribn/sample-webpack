import { request } from './ze-http-request';
import { getApplicationConfiguration, getToken, ZEPHYR_API_ENDPOINT } from 'zephyr-edge-contract';

const log = (v: unknown): void => console.log(v);

interface LogEventOptions {
  level: string;
  action: string;
  message: string;
  meta?: Record<string, unknown>;
}

export interface LoggerOptions {
  application_uid: string;
  zeConfig: {
    buildId: string | undefined;
  };
  isCI: boolean;
  app: Record<string, unknown>;
  git: Record<string, unknown>;
}

export function logger(options: LoggerOptions) {
  return function logEvent({ level, action, message, meta }: LogEventOptions) {
    const application_uid = options.application_uid;
    Promise.all([
      getApplicationConfiguration({ application_uid }),
      getToken()])
      .then(
        ([application_config, token]) => {
          const { username, user_uuid } =
            application_config;
          const zeBuildId = options.zeConfig.buildId;
          const git = options.git;
          const createdAt = Date.now();

          if (!level && !action) {
            throw new Error('log level and action type must be provided');
          }

          message = `[${options.application_uid}](${username})[${zeBuildId}]: ${message}`;
          meta = Object.assign({}, meta, {
            isCI: options.isCI,
            app: options.app,
            git: options.git
          });

          const data = JSON.stringify({
            application_uid,
            userId: user_uuid,
            username,
            zeBuildId,
            logLevel: level,
            actionType: action,
            git,
            message,
            meta,
            createdAt
          });

          const reqOptions = {
            path: `/v2/application/logs`,
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json',
              'Content-Length': data.length
            }
          };

          log(`[zephyr]: ${message}`);
          request(ZEPHYR_API_ENDPOINT, reqOptions, data).catch(() => void 0);
        }
      );
  };
}
