
function createSnapshot(options, assets) {
  return {
    id: options.snapshotId,
    type: 'snapshot',
    creator: options.git,
    createdAt: Date.now(),
    assets: Object.keys(assets).reduce((memo, hash) => {
      const asset = assets[hash];
      memo[asset.path] = {
        path: asset.path,
        extname: asset.extname,
        hash: asset.hash,
        size: asset.size
      };
      return memo;
    }, {})
  };
}

module.exports = { createSnapshot };
