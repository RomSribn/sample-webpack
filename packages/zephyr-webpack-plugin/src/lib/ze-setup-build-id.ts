import { Compiler } from 'webpack';
import { request } from './utils/ze-http-request';
import { ZeWebpackPluginOptions } from '../types/ze-webpack-plugin-options';

import {
  checkAuth,
  getApplicationConfiguration,
  getToken,
} from 'zephyr-edge-contract';
import { logger } from './utils/ze-log-event';
import { replaceRemotesWithDelegates } from './dependency-resolution/replace-remotes-with-delegates';
import { DependencyResolutionError } from '../delegate-module/zephyr-delegate';
import { ConfigurationError } from './errors/configuration-error';

export async function getBuildId(
  application_uid: string
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
  compiler: Compiler
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

    const resolvedDeps = await replaceRemotesWithDelegates(compiler.options, {
      org: pluginOptions.app.org,
      project: pluginOptions.app.project,
    });
    const errors = resolvedDeps
      .flat()
      .filter((res: unknown) => res && (res as DependencyResolutionError).error)
      .map((result: unknown) => {
        return (result as DependencyResolutionError).application_uid;
      });
    if (errors?.length) {
      const [sample_app_name, sample_project_name, sample_org_name] =
        errors[0].split('.');
      throw new ConfigurationError(`Could not resolve remote entry points for urls: \n
      ${errors.map((str) => `\t- ${str}`).join('\n')}\n\n
        Please build them with Zephyr first or add as Unmanaged applications.\n
        Note: you can read application uid as follows:
        \t - ${sample_app_name} - project.json 'name' field of remote application
        \t - ${sample_project_name} - git repository name
        \t - ${sample_org_name} - git organization name

        Or join and ask question in our discord: https://discord.gg/EqFbSSt8Hx
      `);
    }

    const buildId = await getBuildId(application_uid).catch((err) => {
      logEvent({
        level: 'error',
        action: 'build:get-build-id:error',
        message: `error receiving build number for '${email}'`,
        meta: err.message,
      });
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
