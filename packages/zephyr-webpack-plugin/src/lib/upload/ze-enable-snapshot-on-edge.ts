import { logger } from '../utils/ze-log-event';
import { uploadEnvs } from './ze-upload-file';
import { Snapshot, ZeEnvs } from 'zephyr-edge-contract';
import { ZeWebpackPluginOptions } from '../../types/ze-webpack-plugin-options';
import { ZeUploadBuildStats } from './ze-upload-build-stats';

export async function zeEnableSnapshotOnEdge(
  pluginOptions: ZeWebpackPluginOptions,
  snapshot: Snapshot,
  envs_jwt: ZeUploadBuildStats,
): Promise<void> {
  const logEvent = logger(pluginOptions);

  logEvent({
    level: 'info',
    action: 'deploy:edge:started',
    message: `started deploying local build to edge`,
  });

  const deployStart = Date.now();

  // todo: upload context to API and get
  // todo: get urls from ze API
  const envs: ZeEnvs = {
    snapshot_id: envs_jwt.app_version.application_uid,
    urls: envs_jwt.urls,
  };

  const latest = await uploadEnvs(envs);

  if (latest) {
    logEvent({
      level: 'info',
      action: 'deploy:edge:done',
      message: `local build deployed to edge in ${Date.now() - deployStart}ms`,
    });
  } else {
    logEvent({
      level: 'error',
      action: 'deploy:edge:failed',
      message: `failed deploying local build to edge`,
    });
  }
}
