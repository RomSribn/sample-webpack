import { Compiler } from 'webpack';
import { request } from './ze-http-request';
import { ZeWebpackPluginOptions } from './ze-webpack-plugin';

// fix: hardcode
const port = 443;
const hostname = 'ze-build-id.valorkin.dev';

// todo: introduce ze-api-typings
export async function getBuildId(
  key: string
): Promise<Record<string, string> | undefined> {
  const options = {
    hostname,
    port,
    path: `/?key=${key}`,
    method: 'GET',
  };

  const resp = await request<Record<string, string>>(options, void 0, true);
  if (typeof resp === 'string' || !resp) {
    // todo: handle error
    return void 0;
  }

  return resp;
}

export function setupBuildId(
  { pluginName, zeConfig }: ZeWebpackPluginOptions,
  compiler: Compiler
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
