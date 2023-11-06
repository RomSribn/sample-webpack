const { ze_dev_env } = require('./_ze-assumptions');

function createSnapshot(assets) {
  return {
    id: ze_dev_env.snapshotId,
    type: 'snapshot',
    creator: ze_dev_env.git,
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
