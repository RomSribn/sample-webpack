const { request } = require('./ze-http-request');

const port = 443;
const hostname = 'ze-build-id.valorkin.dev';

async function getBuildId(key) {
  const options = {
    hostname,
    port,
    path: `/?key=${key}`,
    method: 'GET',
  };

  return request(options, void 0, true);
}
function setupBuildId({ pluginName, zeConfig }, compiler) {
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

module.exports = { setupBuildId };
