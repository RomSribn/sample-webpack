const { logEvent } = require('./ze-log-event');
const { upload, uploadFile } = require('./ze-http-upload');

async function zeUploadAssets({ missingAssets, assetsMap, count }) {
  if (!missingAssets?.assets || Object.keys(missingAssets.assets).length === 0) {
    logEvent({
      level: 'info',
      action: 'snapshot:assets:upload:empty',
      message: `no new assets to upload`
    });
    return true;
  }

  logEvent({
    level: 'info',
    action: 'snapshot:assets:upload:started',
    message: `uploading missing assets to zephyr (queued ${missingAssets?.assets?.length} out of ${count})`
  });

  let totalTime = 0;
  const assets = Object.values(missingAssets.assets);

  return await Promise
    .all(assets
      .map((asset) => {
        const start = Date.now();
        return uploadFile(asset.hash, assetsMap[asset.hash])
          .then(_ => {
            const fileUploaded = Date.now() - start;
            totalTime += fileUploaded;
            logEvent({
              level: 'info',
              action: 'snapshot:assets:upload:file:done',
              message: `file ${asset.path} uploaded in ${fileUploaded}ms`
            });
          });
      }))
    .then(_ => {
      logEvent({
        level: 'info',
        action: 'snapshot:assets:upload:done',
        message: `uploaded missing assets to zephyr (${missingAssets?.assets?.length} assets in ${totalTime}ms)`
      });
      return true;
    })
    .catch((err) => {
      logEvent({
        level: 'error',
        action: 'snapshot:assets:upload:failed',
        message: `failed uploading missing assets to zephyr`,
        meta: { error: err.toString() }
      });
      return false;
    });
}

module.exports = { zeUploadAssets };
