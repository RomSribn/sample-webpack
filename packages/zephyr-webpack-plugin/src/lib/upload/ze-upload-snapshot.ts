import { SnapshotUploadRes, uploadSnapshot } from './ze-upload-file';
import { logger } from '../ze-log-event';
import { ZeWebpackPluginOptions } from '../ze-webpack-plugin';
import { Snapshot } from '../ze-build-snapshot';

export async function zeUploadSnapshot(
  pluginOptions: ZeWebpackPluginOptions,
  snapshot: Snapshot
): Promise<SnapshotUploadRes | undefined> {
  const { buildEnv } = pluginOptions;
  const logEvent = logger(pluginOptions);
  const snapUploadMs = Date.now();

  logEvent({
    level: 'info',
    action: 'snapshot:upload:started',
    message: `started uploading of ${buildEnv} snapshot to zephyr`,
  });

  const edgeTodo = await uploadSnapshot(snapshot.id, snapshot);

  if (!edgeTodo) {
    logEvent({
      level: 'error',
      action: 'snapshot:upload:failed',
      message: `failed uploading of ${buildEnv} snapshot to zephyr`,
    });
  } else {
    logEvent({
      level: 'info',
      action: 'snapshot:upload:done',
      message: `uploaded ${buildEnv} snapshot in ${
        Date.now() - snapUploadMs
      }ms`,
    });
  }

  return edgeTodo;
}
