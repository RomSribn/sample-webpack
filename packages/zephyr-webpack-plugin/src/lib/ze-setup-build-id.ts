import { Compiler } from 'webpack';
import { request } from './utils/ze-http-request';
import { ZeWebpackPluginOptions } from '../types/ze-webpack-plugin-options';

import {
  checkAuth,
  getApplicationConfiguration,
  getToken,
} from 'zephyr-edge-contract';
import { logger } from './utils/ze-log-event';

export async function getBuildId(
  application_uid: string,
): Promise<string | undefined> {
  const { BUILD_ID_ENDPOINT, user_uuid, jwt } =
    await getApplicationConfiguration({
      application_uid,
    });
  const token = await getToken();

  const options = {
    path: `/`,
    method: 'GET',
    headers: {
      can_write_jwt: jwt,
      Authorization: 'Bearer ' + token,
    },
  };

  type BuildIdResp =
    | string
    | Record<string, string>
    | { status: number; message: string };
  const resp = await request<BuildIdResp>(BUILD_ID_ENDPOINT, options);

  if (typeof resp === 'string') {
    throw new Error(resp);
  }
  if (!resp || (typeof resp.status === 'number' && resp.status !== 200)) {
    throw new Error(resp.message);
  }

  return (resp as Record<string, string>)[user_uuid];
}

export function setupZephyrConfig(
  pluginOptions: ZeWebpackPluginOptions,
  compiler: Compiler,
): void {
  const logEvent = logger(pluginOptions);
  const { pluginName, zeConfig, application_uid } = pluginOptions;
  compiler.hooks.beforeCompile.tapAsync(pluginName, async (params, cb) => {
    await checkAuth();
    const { username, email, EDGE_URL } = await getApplicationConfiguration({
      application_uid,
    });
    zeConfig.user = username;
    zeConfig.edge_url = EDGE_URL;
    zeConfig.buildId = void 0;

    const buildId = await getBuildId(application_uid).catch((err) => {
      logEvent({
        level: 'error',
        action: 'build:get-build-id:error',
        message: `error receiving build number for '${email}'`,
        meta: err.message,
      });
      console.error(err);
    });

    if (buildId) {
      zeConfig.buildId = buildId;
      logEvent({
        level: 'info',
        action: 'build:get-build-id:done',
        message: `received build number '${buildId}' for '${zeConfig.user}'`,
      });
    }

    return cb();
  });
}
