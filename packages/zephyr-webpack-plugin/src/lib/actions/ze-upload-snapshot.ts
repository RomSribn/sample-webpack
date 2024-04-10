import { logger } from '../utils/ze-log-event';
import { Snapshot, SnapshotUploadRes } from 'zephyr-edge-contract';
import { ZeWebpackPluginOptions } from '../../types/ze-webpack-plugin-options';
import { uploadSnapshot } from '../upload/upload-snapshot';

export async function zeUploadSnapshot(
  pluginOptions: ZeWebpackPluginOptions,
  snapshot: Snapshot,
): Promise<SnapshotUploadRes | undefined> {
  const { buildEnv } = pluginOptions;
  const logEvent = logger(pluginOptions);
  const snapUploadMs = Date.now();

  logEvent({
    level: 'info',
    action: 'snapshot:upload:started',
    message: `started uploading of ${buildEnv} snapshot to zephyr`,
  });

  let error;
  const edgeTodo = await uploadSnapshot({
    body: snapshot,
    application_uid: pluginOptions.application_uid,
  }).catch((err) => (error = err));

  if (!edgeTodo || error) {
    logEvent({
      level: 'error',
      action: 'snapshot:upload:failed',
      message: `failed uploading of ${buildEnv} snapshot to zephyr`,
    });
    return;
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
