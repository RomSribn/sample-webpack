const { setupBuildId } = require('./ze-setup-build-id');
const { logBuildSteps } = require('./ze-setup-build-steps-logging');
const { setupZeDeploy } = require('./ze-setup-ze-deploy');
const { ze_dev_env } = require('./_ze-assumptions');
const { getPackageJson } = require('./ze-find-app-name');

const pluginName = 'ZeWebpackPlugin';
class ZeWebpackPlugin {
  _options = {};
  constructor(options = {}) {
    this._options = options;
  }
  apply(compiler) {
    setupBuildId(pluginName, compiler);
    logBuildSteps(pluginName, compiler);
    setupZeDeploy(pluginName, compiler);
  }
}

module.exports = { ZeWebpackPlugin, ZephyrWebpackPlugin: ZeWebpackPlugin };
