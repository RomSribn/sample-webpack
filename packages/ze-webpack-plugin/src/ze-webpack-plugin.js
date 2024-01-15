const { setupBuildId } = require('./ze-setup-build-id');
const { logBuildSteps } = require('./ze-setup-build-steps-logging');
const { setupZeDeploy } = require('./ze-setup-ze-deploy');
const isCI = require('is-ci');

const pluginName = 'ZeWebpackPlugin';

class ZeWebpackPlugin {
  _options = {
    pluginName,
    isCI,
    buildEnv: isCI ? 'ci' : 'local',
    get appName() {
      return `${this.app.org}-${this.app.project}-${this.app.name}`;
    },
    get username() {
      return this.zeConfig.user;
    },
    get snapshotId() {
      return `${this.appName}_${this.zeConfig.user}_${this.zeConfig.buildId}`;
    },
    zeConfig: {
      user: 'valorkin',
      buildId: void 0,
    },
    app: {
      // git org
      org: '',
      // git repo
      project: '',
      // package.json name
      name: '',
    },
    // todo: what if git not configured? - skip for now
    git: {
      name: '',
      email: '',
      branch: '',
      commit: '',
    },
  };

  constructor(options = {}) {
    this._options = Object.assign(this._options, options);
  }

  apply(compiler) {
    setupBuildId(this._options, compiler);
    logBuildSteps(this._options, compiler);
    setupZeDeploy(this._options, compiler);
  }
}

module.exports = { ZeWebpackPlugin, ZephyrWebpackPlugin: ZeWebpackPlugin };
