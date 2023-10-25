const { logEvent } = require('./ze-log-event');
const { upload } = require('./ze-http-upload');

async function zeUploadAssets({missingAssets, uploadableAssets, count}) {
  if (!missingAssets || !Array.isArray(missingAssets.assets)) {
    return;
  }

  logEvent({
    level: 'info',
    action: 'snapshot:assets:upload:started',
    message: `uploading missing assets to zephyr (queued ${missingAssets?.assets?.length} out of ${count})`
  });

  let totalTime = 0;
  await Promise
    .all(missingAssets.assets.map((asset) => {
      const start = Date.now();
      return upload('file', uploadableAssets[asset.id])
        .then(_ => {
          const ms = Date.now() - start;
          totalTime += ms;
          logEvent({
            level: 'info',
            action: 'snapshot:assets:upload:file:done',
            message: `file ${asset.filepath} uploaded in ${ms}ms`
          })
        });
    }))
    .catch((err) => {
      logEvent({
        level: 'error',
        action: 'snapshot:assets:upload:failed',
        message: `failed uploading missing assets to zephyr`,
        meta: { error: err.toString() }
      });
    });

  logEvent({
    level: 'info',
    action: 'snapshot:assets:upload:done',
    message: `uploaded missing assets to zephyr (${missingAssets?.assets?.length} assets in ${totalTime}ms)`
  });

}

module.exports = { zeUploadAssets };
