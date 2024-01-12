import { ZeWebpackPlugin } from './ze-webpack-plugin';
import { findAppName } from './ze-util-find-app-name';
import { getGitInfo } from './ze-util-get-git-info';
import { Configuration } from 'webpack';

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

export function withZephyr() {
  return function configure(
    config: Configuration
    // { options, context }: Options
  ) {
    const appName = findAppName(config);
    const gitInfo = getGitInfo();
    const { org, project } = gitInfo?.app ?? {};
    const mfConfigs = getMFConfigs(config);
    config.plugins?.push(
      new ZeWebpackPlugin({
        app: {
          name: appName,
          org,
          project,
        },
        git: gitInfo?.git,
        mfConfig: Array.isArray(mfConfigs) ? mfConfigs[0] : void 0,
      })
    );
    return config;
  };
}
