const path = require('node:path');
const { createHash } = require('node:crypto');
const { logger } = require('./ze-log-event');

function getAssetType(asset) {
  return asset.constructor.name;
}
function extractBuffer(asset) {
  const className = getAssetType(asset);
  switch (className) {
    case 'CachedSource':
    case 'CompatSource':
    case 'RawSource':
    case 'ConcatSource':
      return  asset.buffer();
    case 'ReplaceSource':
      return asset.source();
    default:
      return void 0;
  }
}

function zeBuildAssetsMap(pluginOptions, assets) {
  const logEvent = logger(pluginOptions);

  return Object.keys(assets)
    .reduce((memo, filepath) => {
      const asset = assets[filepath];
      const buffer = extractBuffer(asset);

      if (!buffer) {
        logEvent({
          action: 'ze:build:assets:unknown-asset-type',
          level: 'error',
          message: `unknown asset type: ${getAssetType(asset)}`
        });
        return  memo;
      }

      const hash = createHash('sha256')
        .update(buffer.length ? buffer : Buffer.from(filepath, 'utf8'))
        .update(Buffer.from(filepath, 'utf8'))
        .digest('hex');

      // todo: update worker
      memo[hash] = {
        path: filepath,
        extname: path.extname(filepath),
        hash,
        size: buffer.length,
        buffer: buffer
      };
      return memo;
    }, {});

}

module.exports = { zeBuildAssetsMap };
