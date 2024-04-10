import { logger } from '../utils/ze-log-event';
import { Snapshot, ZeUploadBuildStats } from 'zephyr-edge-contract';
import { ZeWebpackPluginOptions } from '../../types/ze-webpack-plugin-options';
import { uploadEnvs } from '../upload/upload-envs';

export async function zeEnableSnapshotOnEdge(
  pluginOptions: ZeWebpackPluginOptions,
  snapshot: Snapshot,
  envs_jwt: ZeUploadBuildStats,
): Promise<void> {
  const logEvent = logger(pluginOptions);
  const deployStart = Date.now();

  logEvent({
    level: 'info',
    action: 'deploy:edge:started',
    message: `started deploying local build to edge`,
  });

  envs_jwt.urls.forEach((url) => {
    logEvent({
      level: 'trace',
      action: 'deploy:url',
      message: `deploying to ${url}`,
    });
  });

  const latest = await uploadEnvs({
    body: envs_jwt,
    application_uid: pluginOptions.application_uid,
  });

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
