import { Configuration, container } from 'webpack';

import { getPackageJson } from './utils/ze-util-find-app-name';
import { getGitInfo } from './utils/ze-util-get-git-info';
import { replace_remote_in_mf_config } from '../delegate-module/zephyr-delegate';
import { ZephyrPluginOptions } from '../types/zephyr-plugin-options';
import { ZeWebpackPlugin } from './ze-webpack-plugin';
import { createFullAppName } from 'zephyr-edge-contract';

const { ModuleFederationPlugin } = container;

function getCopyOfMFOptions(config: Configuration): unknown | Array<unknown> {
  return config.plugins
    ?.filter((plugin) => plugin?.constructor.name === 'ModuleFederationPlugin')
    .map((mf: unknown) => {
      const _mf = mf as { _options: unknown };
      if (!_mf?._options) return;

      return JSON.parse(JSON.stringify(_mf._options));
    })
    .filter(Boolean);
}

export function withZephyr(
  _zephyrOptions?: ZephyrPluginOptions | ZephyrPluginOptions[],
) {
  return async function configure(config: Configuration) {
    //  sources of app name: ze config(git org + git repo + package json name)
    const packageJson = getPackageJson(config.context);
    const gitInfo = getGitInfo();

    // todo: exit zephyr sequence if no git origin or no package json
    if (!gitInfo?.app.org || !gitInfo?.app.project || !packageJson?.name)
      return;

    const { org, project } = gitInfo.app;

    const application_uid = createFullAppName({
      org,
      project,
      name: packageJson?.name,
    });

    // if mfs -> add MF plugins
    // if mfs -> add FederationDashboardPlugin
    const zephyrOptions = Array.isArray(_zephyrOptions)
      ? _zephyrOptions
      : [_zephyrOptions];

    // todo: resolve edge url for current application from zephyr API
    const delegate_config = {
      org,
      project,
      application: undefined,
    };

    const mfConfigs = getCopyOfMFOptions(config);

    const depsResolutionTasks = config.plugins
      ?.filter(
        (plugin) =>
          plugin?.constructor.name.indexOf('ModuleFederationPlugin') === -1,
      )
      ?.map(async (mfConfig) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await replace_remote_in_mf_config(mfConfig, delegate_config);
      });
    if (depsResolutionTasks) {
      await Promise.all(depsResolutionTasks);
    }

    // todo: make sample wich use direct mf config via ze options
    zephyrOptions.forEach((zephyrOption) => {
      if (!zephyrOption) return;

      config.plugins?.push(
        new ModuleFederationPlugin({
          name: application_uid,
          filename: 'remoteEntry.js',
          shared: packageJson?.dependencies,
          exposes: zephyrOption?.exposes,
          // todo: rework this part
          // remotes: zephyrOption.remotes?.map((application) =>
          //   replace_remote_with_delegate(
          //     application,
          //     Object.assign({}, delegate_config, { application })
          //   )
          // )
        }),
      );
    });

    config.plugins?.push(
      new ZeWebpackPlugin({
        application_uid,
        app: {
          name: packageJson.name,
          version: packageJson.version,
          org,
          project,
        },
        git: gitInfo?.git,
        mfConfig: Array.isArray(mfConfigs) ? mfConfigs[0] : void 0,
      }),
    );

    return config;
  };
}
