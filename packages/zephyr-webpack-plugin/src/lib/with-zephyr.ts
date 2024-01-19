import { ZeWebpackPlugin } from './ze-webpack-plugin';
import { findAppName, getPackageJson } from './ze-util-find-app-name';
import { getGitInfo } from './ze-util-get-git-info';
import { Configuration, container } from 'webpack';
import { replace_remote_in_mf_config, replace_remote_with_delegate } from '../delegate-module/zephyr-delegate';

const { ModuleFederationPlugin } = container;

function getMFConfigs(config: Configuration): unknown | Array<unknown> {
  return config.plugins
    ?.filter((plugin) => plugin?.constructor.name === 'ModuleFederationPlugin')
    .map((mf: unknown) => {
      const _mf = mf as { _options: unknown };
      if (!_mf?._options) return;

      return JSON.parse(JSON.stringify(_mf._options));
    })
    .filter(Boolean);
}

interface ZephyrPluginOptions {
  // by default read from package.json
  name?: string;
  // by default - remoteEntry.js
  filename?: string;
  // by default - dependencies from package.json
  shared?: string[];
  // by default - empty
  exposes?: string[];
  // by default - empty
  remotes?: string[];
}

export function withZephyr(
  _zephyrOptions?: ZephyrPluginOptions | ZephyrPluginOptions[]
) {
  return function configure(config: Configuration) {
    const packageJson = getPackageJson(config.context);
    // create full app name from git + package json
    const appName = findAppName(config);
    const gitInfo = getGitInfo();
    const mfConfigs = getMFConfigs(config);
    // config.plugins = config.plugins?.filter(
    //   (plugin) => plugin?.constructor.name !== 'ModuleFederationPlugin',
    // );

    if (!gitInfo?.app || !gitInfo.app.org || !gitInfo.app.project) return ;
    const {org, project} = gitInfo.app;
    // if mfs -> add MF plugins
    // if mfs -> add FederationDashboardPlugin
    const zephyrOptions = Array.isArray(_zephyrOptions)
      ? _zephyrOptions
      : [_zephyrOptions];

    const delegate_config = {
      org,
      project,
      application: undefined,
      edgeUrl: 'cf.valorkin.dev'};

    config.plugins
      ?.filter((plugin) => plugin?.constructor.name === 'ModuleFederationPlugin')
      ?.forEach(mfConfig => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        replace_remote_in_mf_config(mfConfig as any, delegate_config)
      })

    zephyrOptions.forEach((zephyrOption) => {
      if (!zephyrOption) return;

      config.plugins?.push(
        new ModuleFederationPlugin({
          name: appName,
          filename: 'remoteEntry.js',
          shared: packageJson?.dependencies,
          exposes: zephyrOption?.exposes,
          remotes: zephyrOption.remotes
            ?.map(application => replace_remote_with_delegate(application, Object.assign({}, delegate_config, {application})))
        })
      );
    });

    config.plugins?.push(
      new ZeWebpackPlugin({
        app: {
          name: appName,
          org,
          project
        },
        git: gitInfo?.git,
        mfConfig: Array.isArray(mfConfigs) ? mfConfigs[0] : void 0
      })
    );
    return config;
  };
}
