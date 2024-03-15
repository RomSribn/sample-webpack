import { Configuration, container } from 'webpack';
import isCI from 'is-ci';

import { getPackageJson } from './utils/ze-util-find-app-name';
import { getGitInfo } from './utils/ze-util-get-git-info';
import {
  replace_remote_in_mf_config,
  replace_remote_with_delegate,
} from '../delegate-module/zephyr-delegate';
import { ZephyrPluginOptions } from '../types/zephyr-plugin-options';
import { ZeWebpackPlugin } from './ze-webpack-plugin';
import { createFullAppName } from 'zephyr-edge-contract';
import { edge_endpoint } from '../config/endpoints';
import { FederationDashboardPlugin } from '../federation-dashboard-legacy/utils/federation-dashboard-plugin/FederationDashboardPlugin';

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
  return function configure(config: Configuration) {
    //  sources of app name: ze config(git org + git repo + package json name)
    const packageJson = getPackageJson(config.context);
    const gitInfo = getGitInfo();

    // todo: exit zephyr sequence if no git origin or no package json
    if (!gitInfo?.app.org || !gitInfo?.app.project || !packageJson?.name)
      return;

    const { org, project } = gitInfo.app;

    const fullAppName = createFullAppName({
      org: org,
      project: project,
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
      edgeUrl: edge_endpoint.hostname,
    };

    const mfConfigs = getCopyOfMFOptions(config);

    config.plugins
      ?.filter(
        (plugin) => plugin?.constructor.name === 'ModuleFederationPlugin',
      )
      ?.forEach((mfConfig) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        replace_remote_in_mf_config(mfConfig as any, delegate_config);
      });

    zephyrOptions.forEach((zephyrOption) => {
      if (!zephyrOption) return;

      config.plugins?.push(
        new ModuleFederationPlugin({
          name: fullAppName,
          filename: 'remoteEntry.js',
          shared: packageJson?.dependencies,
          exposes: zephyrOption?.exposes,
          remotes: zephyrOption.remotes?.map((application) =>
            replace_remote_with_delegate(
              application,
              Object.assign({}, delegate_config, { application }),
            ),
          ),
        }),
      );
    });

    config.plugins?.push(
      new ZeWebpackPlugin({
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

    // todo: send token as auth bearer
    // todo: application uid
    // todo: npm-like version

    /*    config.plugins?.push(
      new FederationDashboardPlugin({
        app: {
          name: packageJson.name,
          version: packageJson.version,
          org,
          project,
        },
        git: gitInfo?.git,
        context: {
          isCI
        },
        // debug: true,
        // versionStrategy: 'buildHash',
        filename: 'dashboard.json',
        // environment: 'development',
        // dashboardURL: `http://localhost:3333/update`,
        dashboardURL: `http://localhost:3333/v2/builder-packages-api/upload-from-dashboard-plugin`,
        // dashboardURL: `https://api-dev.zephyr-cloud.io/v2/builder-packages-api/upload-from-dashboard-plugin`,
        metadata: {
          // todo: domain
          baseUrl: 'https://cf.valorkin.dev',
          source: {
            // todo: git remote + context
            url: 'https://github.com/ZephyrCloudIO/zephyr-cloud-io/tree/main/examples/react-18/template/host',
          },
          // todo: full remote url from ZeWebpackPlugin
          remote: 'http://localhost:3000/remoteEntry.js',
        },
      }),
    );*/

    return config;
  };
}
