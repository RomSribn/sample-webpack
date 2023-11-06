const isCI = require('is-ci');
const { ZeWebpackPlugin } = require('./ze-webpack-plugin');
const { ze_dev_env } = require('./_ze-assumptions');
const { getPackageJson } = require('./ze-find-app-name');

ze_dev_env.isCI = isCI;

function withZephyr(pluginOptions) {
  return function configure(config, { options, context }) {
    const appName = findAppName(config);
    const gitInfo = getGitInfo();
    ze_dev_env.app.name = appName;
    ze_dev_env.git = gitInfo.git;
    const {org, project} = gitInfo.app;
    ze_dev_env.app.org = gitInfo.app.org;
    ze_dev_env.app.project = gitInfo.app.project;
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
    return packageJson.name;
  }
}

function getGitInfo() {
  try {
    const { execSync } = require('node:child_process');

    const username = execSync('git config user.name').toString().trim();
    const email = execSync('git config user.email').toString().trim();
    const remoteOrigin = execSync('git config --get remote.origin.url').toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const commitHash = execSync('git rev-parse HEAD').toString().trim();

    // parse remote origin url to get the organization and repository name
    const urlParts = remoteOrigin
      .replace(/.+@/, '') // Remove the protocol (like https://) and user info
      .replace(/.git$/, '') // Remove the .git at the end
      .split(':') // Split at the colon to separate domain from path
      .pop() // Take the last part, which is the path
      .split('/'); // Split the path into parts

    const organization = urlParts.length > 1 ? urlParts[urlParts.length - 2] : null;
    const repositoryName = urlParts.length > 0 ? urlParts[urlParts.length - 1] : null;

    return {
      git: {
        name: username,
        email,
        branch,
        commit: commitHash,
      },
      app: {
        org: organization,
        project: repositoryName
      }
    };
  } catch (error) {
    console.error('Error retrieving Git information:', error);
    return null;
  }
}

function getGitConfig() {



// Example usage:
  const gitInfo = getGitInfo();
  if (gitInfo) {
    console.log('Git Information:', gitInfo);
  }
}


module.exports = { withZephyr };
