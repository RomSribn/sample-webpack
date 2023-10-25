const { logEvent } = require('./ze-log-event');
const { buildEnv, ze_dev_env } = require('./_ze-assumptions');

function logBuildSteps(pluginName, compiler) {
  const buildStartedAt = Date.now();
  compiler.hooks
    .beforeCompile.tapAsync(pluginName, async (params, cb) => {
    if (!ze_dev_env.zeConfig.buildId) return cb();
    logEvent({
      level: 'info',
      action: 'build:started',
      message: `${buildEnv} build started`
    });
    cb();
  });
  compiler.hooks
    .done.tap(pluginName, () => {
    if (!ze_dev_env.zeConfig.buildId) return;
    logEvent({
      level: 'info',
      action: 'build:done',
      message: `${buildEnv} build finished in ${Date.now() - buildStartedAt}ms`
    });
  });
  compiler.hooks
    .failed.tap(pluginName, (err) => {
    if (!ze_dev_env.zeConfig.buildId) return;
    logEvent({
      level: 'error',
      action: 'build:failed',
      message: `${buildEnv} build failed in ${Date.now() - buildStartedAt}ms}`,
      meta: { error: err.toString() }
    });
  });

  return { buildStartedAt };
}

module.exports = { logBuildSteps };
