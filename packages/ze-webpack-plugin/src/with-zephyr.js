const { ZeWebpackPlugin } = require('./ze-webpack-plugin');
const { ze_dev_env } = require('./_ze-assumptions');
const { getPackageJson } = require('./ze-find-app-name');

function withZephyr(pluginOptions) {
  return function configure(config, { options, context }) {
    const appName = findAppName(config);
    ze_dev_env.app.name = appName;
    config.plugins.push(new ZeWebpackPlugin({
      app: {
        name: appName
      },
    }));
    return config;
  };
}

function findAppName(config) {

  const mfConfig = config.plugins
    .find(plugin => plugin.constructor.name === 'ModuleFederationPlugin');

  if (mfConfig) {
    return mfConfig._options.name;
  }

  if (!config) return this;
  const context = config.context;
  const packageJson = getPackageJson(context);
  if (packageJson && packageJson.name) {
    ze_dev_env.app.name = packageJson.name;
  }

}

module.exports = { withZephyr };
