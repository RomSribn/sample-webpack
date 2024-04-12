import {
  DependencyResolutionError,
  replace_remote_in_mf_config,
} from '../../delegate-module/zephyr-delegate';
import { Configuration } from 'webpack';

export interface DelegateConfig {
  org: string;
  project: string;
  application?: undefined;
}

export async function replaceRemotesWithDelegates(
  _config: unknown,
  { org, project }: DelegateConfig
): Promise<((DependencyResolutionError | void)[] | void)[]> {
  // this is WebpackOptionsNormalized type but this type is not exported
  const config = _config as Configuration;
  const depsResolutionTasks = config.plugins
    ?.filter(
      (plugin) =>
        plugin?.constructor.name.indexOf('ModuleFederationPlugin') !== -1
    )
    ?.map(async (mfConfig) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await replace_remote_in_mf_config(mfConfig, { org, project });
    });

  return Promise.all(depsResolutionTasks ?? []);
}
