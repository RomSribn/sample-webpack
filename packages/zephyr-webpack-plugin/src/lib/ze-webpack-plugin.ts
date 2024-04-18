import type { Compiler } from 'webpack';
import * as isCI from 'is-ci';

import { setupZephyrConfig } from './ze-setup-build-id';
import { logBuildSteps } from './ze-setup-build-steps-logging';
import { setupZeDeploy } from './ze-setup-ze-deploy';
import { FederationDashboardPlugin } from '../federation-dashboard-legacy/utils/federation-dashboard-plugin/FederationDashboardPlugin';
import { ZeWebpackPluginOptions } from '../types/ze-webpack-plugin-options';

const pluginName = 'ZeWebpackPlugin';

const default_zewebpack_options = {
  pluginName,
  isCI,
  buildEnv: isCI ? 'ci' : 'local',
  zeConfig: {},
  app: {},
  git: {},
};

export class ZeWebpackPlugin {
  _options = default_zewebpack_options as ZeWebpackPluginOptions;

  constructor(options = {}) {
    this._options = Object.assign(this._options, options ?? {});
  }

  apply(compiler: Compiler): void {
    setupZephyrConfig(this._options, compiler);
    logBuildSteps(this._options, compiler);
    setupZeDeploy(this._options, compiler);
  }
}
