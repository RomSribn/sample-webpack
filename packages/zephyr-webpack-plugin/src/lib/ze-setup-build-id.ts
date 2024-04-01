import { Compiler } from 'webpack';
import { request } from './utils/ze-http-request';
import { buildid_endpoint } from '../config/endpoints';
import { ZeWebpackPluginOptions } from '../types/ze-webpack-plugin-options';

const { port, hostname } = buildid_endpoint;
export async function getBuildId(
  key: string,
): Promise<Record<string, string> | undefined> {
  const options = {
    hostname,
    port,
    path: `/?key=${key}`,
    method: 'GET',
  };

  const resp = await request<Record<string, string>>(options, void 0);
  if (typeof resp === 'string' || !resp) {
    // todo: handle error
    return void 0;
  }

  return resp;
}

export function setupBuildId(
  { pluginName, zeConfig }: ZeWebpackPluginOptions,
  compiler: Compiler,
): void {
  compiler.hooks.beforeCompile.tapAsync(pluginName, async (params, cb) => {
    zeConfig.buildId = void 0;
    if (!zeConfig.user) {
      // todo: user should login first to use zephyr cloud
      return cb();
    }

    const buildIds = await getBuildId(zeConfig.user);
    if (buildIds) {
      zeConfig.buildId = buildIds[zeConfig.user];
    }

    return cb();
  });
}
