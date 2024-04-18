import { Configuration } from 'webpack';
import { createFullAppName } from 'zephyr-edge-contract';

import { getPackageJson } from './utils/ze-util-read-package-json';
import { getGitInfo } from './utils/ze-util-get-git-info';
import { isModuleFederationPlugin } from './utils/is-mf-plugin';
import { ZeWebpackPlugin } from './ze-webpack-plugin';
import { resolve_remote_dependencies } from './dependency-resolution/resolve-remote-dependencies';
import { ZephyrPluginOptions } from '../types/zephyr-plugin-options';

function getCopyOfMFOptions(config: Configuration): unknown | Array<unknown> {
  return config.plugins
    ?.filter(isModuleFederationPlugin)
    .map((mf: unknown) => {
      const _mf = mf as { _options: unknown };
      if (!_mf?._options) return;

      return JSON.parse(JSON.stringify(_mf._options));
    })
    .filter(Boolean);
}

export function withZephyr(_zephyrOptions?: ZephyrPluginOptions) {
  return async function configure(
    config: Configuration
  ): Promise<Configuration> {
    const packageJson = getPackageJson(config.context);
    if (!packageJson) return config;

    const gitInfo = getGitInfo();

    if (!gitInfo?.app.org || !gitInfo?.app.project || !packageJson?.name)
      return config;

    await resolve_remote_dependencies(config, {
      org: gitInfo.app.org,
      project: gitInfo.app.project,
    });

    const mfConfigs = getCopyOfMFOptions(config);
    config.plugins?.push(
      new ZeWebpackPlugin({
        application_uid: createFullAppName({
          org: gitInfo.app.org,
          project: gitInfo.app.project,
          name: packageJson?.name,
        }),
        app: {
          name: packageJson.name,
          version: packageJson.version,
          org: gitInfo.app.org,
          project: gitInfo.app.project,
        },
        git: gitInfo?.git,
        mfConfig: Array.isArray(mfConfigs) ? mfConfigs[0] : void 0,
        wait_for_index_html: _zephyrOptions?.wait_for_index_html,
      })
    );

    return config;
  };
}

// todo: make sample wich use direct mf config via ze options
function todo_implement_direct_zephyr_usage(): void {
  // if mfs -> add MF plugins
  // if mfs -> add FederationDashboardPlugin
  // const zephyrOptions = Array.isArray(_zephyrOptions)
  //   ? _zephyrOptions
  //   : [_zephyrOptions];
  /*    zephyrOptions.forEach((zephyrOption) => {
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
      });*/
}
