import { Compiler } from 'webpack';
import { checkAuth, getApplicationConfiguration, getToken, request, ze_error, ze_log } from 'zephyr-edge-contract';
import { ZeWebpackPluginOptions } from '../types/ze-webpack-plugin-options';
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
  ze_log('Setting Get Zephyr Config hook');
  const logEvent = logger(pluginOptions);
  const { pluginName, zeConfig, application_uid } = pluginOptions;

  compiler.hooks.beforeCompile.tapAsync(pluginName, async (params, cb) => {
    ze_log('Going to check auth token or get it');
    await checkAuth();

    ze_log('Got auth token, going to get application configuration');
    const { username, email, EDGE_URL } = await getApplicationConfiguration({
      application_uid,
    });
    ze_log('Got application configuration', { username, email, EDGE_URL });
    zeConfig.user = username;
    zeConfig.edge_url = EDGE_URL;
    zeConfig.buildId = void 0;

    ze_log('Going to get build id');
    const buildId = await getBuildId(application_uid).catch((err) => {
      logEvent({
        level: 'error',
        action: 'build:get-build-id:error',
        message: `error receiving build number for '${email}'\n
        ${err.message}\n`,
      });
    });

    if (!buildId) {
      ze_error('Could not get build id');
      return cb(new Error('Could not get build id'));
    }

    zeConfig.buildId = buildId;
    logEvent({
      level: 'info',
      action: 'build:get-build-id:done',
      message: `received build number '${buildId}' for '${zeConfig.user}'`,
    });

    return cb();
  });
}
