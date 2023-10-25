const { request } = require('./ze-http-request');
const { ze_dev_env } = require('./_ze-assumptions');

const port = 443;
const hostname = 'ze-worker-to-generate-build-id.valorkin.workers.dev';

async function getBuildId(key) {
  const options = {
    hostname,
    port,
    path: `/?key=${key}`,
    method: 'GET'
  };

  return request(options, void 0, true);
}
function setupBuildId(pluginName, compiler) {
  compiler.hooks.beforeCompile.tapAsync(pluginName, async (params, cb) => {
    ze_dev_env.zeConfig.buildId = void 0;
    const buildIds = await getBuildId(ze_dev_env.git.email);
    if (buildIds) {
      ze_dev_env.zeConfig.buildId = (buildIds)[ze_dev_env.git.email];
    }
    cb();
  });
}

module.exports = {setupBuildId};
