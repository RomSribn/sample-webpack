const { ZeWebpackPlugin } = require('./ze-webpack-plugin');
const { findAppName } = require('./ze-util-find-app-name');
const { getGitInfo } = require('./ze-util-get-git-info');

function withZephyr() {
  return function configure(config, { options, context }) {
    const appName = findAppName(config);
    const gitInfo = getGitInfo();
    const {org, project} = gitInfo.app;
    config.plugins.push(new ZeWebpackPlugin({
      app: {
        name: appName,
        org,
        project
      },
      git: gitInfo.git
    }));
    return config;
  };
}




module.exports = { withZephyr };
