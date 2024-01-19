import { ZeWebpackPlugin } from './ze-webpack-plugin';
import { findAppName, getPackageJson } from './ze-util-find-app-name';
import { getGitInfo } from './ze-util-get-git-info';
import { Configuration, container } from 'webpack';

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
  _zephyrOptions?: ZephyrPluginOptions | ZephyrPluginOptions[],
) {
  return function configure(config: Configuration) {
    const packageJson = getPackageJson(config.context);
    // create full app name from git + package json
    const appName = findAppName(config);
    const gitInfo = getGitInfo();

    const { org, project } = gitInfo?.app ?? {};
    const mfConfigs = getMFConfigs(config);
    config.plugins = config.plugins?.filter(
      (plugin) => plugin?.constructor.name !== 'ModuleFederationPlugin',
    );

    // if mfs -> add MF plugins
    // if mfs -> add FederationDashboardPlugin
    const zephyrOptions = Array.isArray(_zephyrOptions)
      ? _zephyrOptions
      : [_zephyrOptions];

    zephyrOptions.forEach((zephyrOption) => {
      if (!zephyrOption) return;
      config.plugins?.push(
        new ModuleFederationPlugin({
          name: appName,
          filename: 'remoteEntry.js',
          shared: packageJson?.dependencies,
          exposes: zephyrOption?.exposes,
          // remotes: {
          //   remote: clientVersion({
          //     currentHost: 'home',
          //     remoteName: 'remote',
          //     dashboardURL
          //   })
          // }
        }),
      );
    });

    config.plugins?.push(
      new ZeWebpackPlugin({
        app: {
          name: appName,
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
