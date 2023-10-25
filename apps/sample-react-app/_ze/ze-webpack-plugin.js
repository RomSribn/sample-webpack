const { setupBuildId } = require('./ze-setup-build-id');
const { logBuildSteps } = require('./ze-setup-build-steps-logging');
const { setupZeDeploy } = require('./ze-setup-ze-deploy');

const pluginName = 'ZeWebpackPlugin';
class ZeWebpackPlugin {
  apply(compiler) {
    setupBuildId(pluginName, compiler);
    logBuildSteps(pluginName, compiler);
    setupZeDeploy(pluginName, compiler);
  }
}

module.exports = { ZeWebpackPlugin, ZephyrWebpackPlugin: ZeWebpackPlugin };
