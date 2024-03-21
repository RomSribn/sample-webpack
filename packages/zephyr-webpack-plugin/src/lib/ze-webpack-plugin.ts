import type { Compiler } from 'webpack';
import * as isCI from 'is-ci';

import { setupBuildId } from './ze-setup-build-id';
import { logBuildSteps } from './ze-setup-build-steps-logging';
import { setupZeDeploy } from './ze-setup-ze-deploy';
import { createFullAppName } from 'zephyr-edge-contract';
import { FederationDashboardPlugin } from '../federation-dashboard-legacy/utils/federation-dashboard-plugin/FederationDashboardPlugin';
import { telemetry_api_endpoint } from '../config/endpoints';

const pluginName = 'ZeWebpackPlugin';

const default_zewebpack_options = {
  pluginName,
  isCI,
  buildEnv: isCI ? 'ci' : 'local',
  get appName() {
    return createFullAppName(this.app);
  },
  get username() {
    return this.zeConfig.user;
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
    // package.json version
    version: '',
  },
  // todo: what if git not configured? - skip for now
  git: {
    name: '',
    email: '',
    branch: '',
    commit: '',
  },
  dashboard: {
    // eslint-disable-next-line
    apply: (compiler: Compiler) => {},
  },
};

export class ZeWebpackPlugin {
  _options = default_zewebpack_options;

  constructor(options = {}) {
    this._options = Object.assign(this._options, options ?? {});
  }

  apply(compiler: Compiler): void {
    setupBuildId(this._options, compiler);
    logBuildSteps(this._options, compiler);
    // setup dashboard plugin,
    // - dash plugin should call a cb with data to be uploaded to API
    // -
    this._options.dashboard = new FederationDashboardPlugin({
      zeOptions: this._options,
      app: this._options.app,
      git: this._options.git,
      context: {
        isCI,
      },
      dashboardURL: telemetry_api_endpoint,
    });
    this._options.dashboard.apply(compiler);
    setupZeDeploy(this._options, compiler);
  }
}
