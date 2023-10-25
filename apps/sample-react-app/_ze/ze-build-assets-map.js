const {createHash} = require('node:crypto')

function zeBuildAssetsMap(assets) {
  const uploadableAssets = {};
  const snapshotAssets = Object.keys(assets)
    .map((key) => {
      const asset = assets[key];
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
          console.log(`unknown asset type: ${className}`);
          return;
      }
      // todo: log internal error
      const hash = createHash('sha256')
        .update(buffer)
        .update(Buffer.from(key, 'utf8'))
        .digest('hex');
      uploadableAssets[hash] = {
        id: hash, filepath: key, buffer: buffer
      };
      return {
        id: hash, filepath: key
      };
    })
    .filter(Boolean);

  // const snapshotId = createHash('sha256')
  //   .update(snapshotAssets
  //     .map(asset => asset.id).sort().join(''))
  //   .digest('hex');

  return {uploadableAssets, snapshotAssets};
}

module.exports = { zeBuildAssetsMap };
