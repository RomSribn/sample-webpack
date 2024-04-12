import { Configuration } from 'webpack';
import { createFullAppName } from 'zephyr-edge-contract';

import { getPackageJson } from './utils/ze-util-read-package-json';
import { getGitInfo } from './utils/ze-util-get-git-info';
import { ZeWebpackPlugin } from './ze-webpack-plugin';
import { replaceRemotesWithDelegates } from './dependency-resolution/replace-remotes-with-delegates';
import { DependencyResolutionError } from '../delegate-module/zephyr-delegate';
import { ConfigurationError } from './errors/configuration-error';

function getCopyOfMFOptions(config: Configuration): unknown | Array<unknown> {
  return config.plugins
    ?.filter(
      (plugin) =>
        plugin?.constructor.name.indexOf('ModuleFederationPlugin') !== -1
    )
    .map((mf: unknown) => {
      const _mf = mf as { _options: unknown };
      if (!_mf?._options) return;

      return JSON.parse(JSON.stringify(_mf._options));
    })
    .filter(Boolean);
}

export function withZephyr() {
  // _zephyrOptions?: ZephyrPluginOptions | ZephyrPluginOptions[],
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
      })
    );

    return config;
  };
}

async function resolve_remote_dependencies(
  config: Configuration,
  app: {
    org: string;
    project: string;
  }
): Promise<void> {
  const resolvedDeps = await replaceRemotesWithDelegates(config, {
    org: app.org,
    project: app.project,
  });
  const errors = resolvedDeps
    .flat()
    .filter((res: unknown) => res && (res as DependencyResolutionError).error)
    .map((result: unknown) => {
      return (result as DependencyResolutionError).application_uid;
    });
  if (errors?.length) {
    const [sample_app_name, sample_project_name, sample_org_name] =
      errors[0].split('.');
    throw new ConfigurationError(`Could not resolve remote entry points for urls: \n
      ${errors.map((str) => `\t- ${str}`).join('\n')}\n\n
        Please build them with Zephyr first or add as Unmanaged applications.\n
        Note: you can read application uid as follows:
        \t - ${sample_app_name} - project.json 'name' field of remote application
        \t - ${sample_project_name} - git repository name
        \t - ${sample_org_name} - git organization name

        Or join and ask question in our discord: https://discord.gg/EqFbSSt8Hx
      `);
  }
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
