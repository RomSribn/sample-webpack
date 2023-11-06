const path = require('node:path');
const { createHash } = require('node:crypto');
const { logEvent } = require('./ze-log-event');

function extractBuffer(asset) {
  const className = asset.constructor.name;
  switch (className) {
    case 'CachedSource':
      return  asset._cachedBuffer ?? asset._cachedSource;
    case 'RawSource':
      return asset._valueAsBuffer ?? asset._valueAsString;
    case 'ConcatSource':
      return extractBuffer(asset._children[0]);
    case 'ReplaceSource':
      return extractBuffer(asset._source);
    default:
      logEvent({
        action: 'ze:build:assets:unknown-asset-type',
        level: 'error',
        message: `unknown asset type: ${className}`
      });
      return void 0;
  }
}

function zeBuildAssetsMap(assets) {
  return Object.keys(assets)
    .reduce((memo, filepath) => {
      const asset = assets[filepath];
      const buffer = extractBuffer(asset);

      if (!buffer) {
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
