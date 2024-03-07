import { Compiler } from 'webpack';
import { logger } from './utils/ze-log-event';
import { ZeWebpackPluginOptions } from '../types/ze-webpack-plugin-options';

export function logBuildSteps(
  pluginOptions: ZeWebpackPluginOptions,
  compiler: Compiler,
): { buildStartedAt: number } {
  const { pluginName, zeConfig, buildEnv } = pluginOptions;
  const logEvent = logger(pluginOptions);

  let buildStartedAt = -1;
  compiler.hooks.beforeCompile.tapAsync(pluginName, async (params, cb) => {
    if (!zeConfig.buildId) return cb();
    buildStartedAt = Date.now();
    logEvent({
      level: 'info',
      action: 'build:started',
      message: `${buildEnv} build started`,
    });
    cb();
  });
  compiler.hooks.done.tap(pluginName, () => {
    if (!zeConfig.buildId) return;
    logEvent({
      level: 'info',
      action: 'build:done',
      message: `${buildEnv} build finished in ${Date.now() - buildStartedAt}ms`,
    });
  });
  compiler.hooks.failed.tap(pluginName, (err) => {
    if (!zeConfig.buildId) return;
    logEvent({
      level: 'error',
      action: 'build:failed',
      message: `${buildEnv} build failed in ${Date.now() - buildStartedAt}ms`,
      meta: { error: err.toString() },
    });
  });

  return { buildStartedAt };
}
