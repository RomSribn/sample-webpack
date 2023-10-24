const { request } = require('./ze-request');

/*    let buildId = -1;
    compiler.hooks.beforeCompile.tapAsync(pluginName, async (params, cb) => {
      buildId = (await getBuildId(ze_dev_env.git.email))[ze_dev_env.git.email];
      cb();
    });
    const replacePathVariables = (path, data, assetInfo) => {
      // todo: if [query] use `&` instead of `?`
      if (typeof path !== 'string' || path.indexOf('name') === -1) return path;
      const operand = path.indexOf('?') > -1 ? '&' : '?';
      // return path.indexOf('query') > -1 ? path : `${path}${operand}[query]`;
      console.log(path, data.filename)
      return path;
    }*/

async function getBuildId(key) {
  const port = 443;
  const hostname = 'ze-worker-to-generate-build-id.valorkin.workers.dev';

  const options = {
    hostname,
    port,
    path: `/?key=${key}`,
    method: 'GET'
  };

  return request(options);
}

module.exports = {getBuildId};
