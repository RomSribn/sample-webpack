const { logEvent } = require('./ze-log-event');
const { upload } = require('./ze-http-upload');

async function zeUploadAssets({ missingAssets, assetsMap, count }) {
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
    .all(Object.keys(missingAssets.assets)
      .map((hash) => {
        const start = Date.now();
        return upload('file', hash, assetsMap[hash])
          .then(_ => {
            const fileUploaded = Date.now() - start;
            totalTime += fileUploaded;
            logEvent({
              level: 'info',
              action: 'snapshot:assets:upload:file:done',
              message: `file ${hash.filepath} uploaded in ${fileUploaded}ms`
            });
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
