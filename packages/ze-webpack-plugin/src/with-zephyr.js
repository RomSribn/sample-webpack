const { ZeWebpackPlugin } = require('./ze-webpack-plugin');
const { findAppName } = require('./ze-util-find-app-name');
const { getGitInfo } = require('./ze-util-get-git-info');

function getMFConfigs(config) {
  return config.plugins
    .filter(plugin => plugin.constructor.name === 'ModuleFederationPlugin')
    .map(mf => JSON.parse(JSON.stringify(mf._options)));
}

function withZephyr() {
  return function configure(config, { options, context }) {
    const appName = findAppName(config);
    const gitInfo = getGitInfo();
    const {org, project} = gitInfo.app;
    const mfConfigs = getMFConfigs(config);
    config.plugins.push(new ZeWebpackPlugin({
      app: {
        name: appName,
        org,
        project
      },
      git: gitInfo.git,
      mfConfig: mfConfigs ? mfConfigs[0] : void 0
    }));
    return config;
  };
}




module.exports = { withZephyr };
