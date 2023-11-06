const { uploadSnapshot } = require('./ze-http-upload');
const { logEvent } = require('./ze-log-event');
const { buildEnv } = require('./_ze-assumptions');

async function zeUploadSnapshot(snapshot) {
  const snapUploadMs = Date.now();

  logEvent({
    level: 'info',
    action: 'snapshot:upload:started',
    message: `started uploading of ${buildEnv} snapshot to zephyr`
  });

  const edgeTodo = await uploadSnapshot(snapshot.id, snapshot);

  if (!edgeTodo) {
    logEvent({
      level: 'error',
      action: 'snapshot:upload:failed',
      message: `failed uploading of ${buildEnv} snapshot to zephyr`
    });
  } else {
    logEvent({
      level: 'info',
      action: 'snapshot:upload:done',
      message: `uploaded ${buildEnv} snapshot in ${Date.now() - snapUploadMs}ms`
    });
  }

  return edgeTodo;
}

module.exports = { zeUploadSnapshot };
