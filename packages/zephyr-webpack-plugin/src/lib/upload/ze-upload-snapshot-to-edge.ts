import { logger } from '../utils/ze-log-event';
import { uploadTags } from './ze-upload-file';
import { ZeWebpackPluginOptions } from '../ze-webpack-plugin';
import { Snapshot } from 'zephyr-edge-contract';

export async function zeUploadSnapshotToEdge(
  pluginOptions: ZeWebpackPluginOptions,
  snapshot: Snapshot,
  tag?: string,
): Promise<void> {
  const logEvent = logger(pluginOptions);

  logEvent({
    level: 'info',
    action: 'deploy:edge:started',
    message: `started deploying local build to edge`,
  });

  const deployStart = Date.now();
  const latest = await uploadTags(pluginOptions.appName, {
    tag: tag ?? 'latest',
    snapshot: snapshot.id,
    app: pluginOptions.appName,
    user: pluginOptions.username,
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
