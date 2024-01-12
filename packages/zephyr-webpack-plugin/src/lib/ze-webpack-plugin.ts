import type { Compiler } from 'webpack';
import * as isCI from 'is-ci';

import { setupBuildId } from './ze-setup-build-id';
import { logBuildSteps } from './ze-setup-build-steps-logging';
import { setupZeDeploy } from './ze-setup-ze-deploy';

const pluginName = 'ZeWebpackPlugin';

export interface ZeWebpackPluginOptions {
  pluginName: string;
  isCI: boolean;
  buildEnv: string;
  appName: string;
  username: string;
  snapshotId: string;
  zeConfig: {
    user: string;
    buildId: string | undefined;
  };
  app: {
    org: string;
    project: string;
    name: string;
  };
  git: {
    name: string;
    email: string;
    branch: string;
    commit: string;
  };
  mfConfig?: unknown;
}

export class ZeWebpackPlugin {
  _options: ZeWebpackPluginOptions = {
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

  apply(compiler: Compiler): void {
    setupBuildId(this._options, compiler);
    logBuildSteps(this._options, compiler);
    setupZeDeploy(this._options, compiler);
  }
}
