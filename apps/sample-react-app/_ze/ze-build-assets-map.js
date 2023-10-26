const path = require('node:path');
const {createHash} = require('node:crypto')
const { logEvent } = require('./ze-log-event');

function zeBuildAssetsMap(assets) {
  return  Object.keys(assets)
    .reduce((memo, filepath) => {
      const asset = assets[filepath];
      const className = asset.constructor.name;
      let buffer;
      switch (className) {
        case 'CachedSource':
          buffer = asset._cachedBuffer ?? asset._cachedSource;
          break;
        case 'RawSource':
          buffer = asset._valueAsBuffer ?? asset._valueAsString;
          break;
        default:
          logEvent({
            action: 'ze:build:assets:unknown-asset-type',
            level: 'error',
            message: `unknown asset type: ${className}`
          })
          return void 0;
      }

      buffer = buffer.length ? buffer : Buffer.from(filepath, 'utf8');

      const hash = createHash('sha256')
        .update(buffer)
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
    });

}

module.exports = { zeBuildAssetsMap };
