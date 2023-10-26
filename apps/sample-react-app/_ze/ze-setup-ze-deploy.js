const { ze_dev_env } = require('./_ze-assumptions');
const { logEvent } = require('./ze-log-event');
const { zeDeploySnapshotToEdge } = require('./ze-deploy-snapshot-to-edge');
const { zeUploadSnapshot } = require('./ze-upload-snapshot');
const { zeUploadAssets } = require('./ze-upload-assets');
const { zeBuildAssetsMap } = require('./ze-build-assets-map');

function createSnapshot(snapshotAssets) {
  return  {
    id: ze_dev_env.zeConfig.buildId,
    type: 'snapshot',
    creator: ze_dev_env.git,
    createdAt: Date.now(),
    assets: snapshotAssets
  };
}

function setupZeDeploy(pluginName, compiler) {
  compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
    compilation.hooks.processAssets.tapPromise({
      name: pluginName,
      stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
    }, async (assets) => {
      if (!ze_dev_env.zeConfig.buildId) {
        // no id - no cloud builds ;)
        return;
      }

      const zeStart = Date.now();
      const assetsMap = zeBuildAssetsMap(assets);
      const snapshot = createSnapshot(assetsMap);
      const missingAssets = await zeUploadSnapshot(snapshot);
      await zeUploadAssets({
        missingAssets,
        assetsMap,
        count: Object.keys(assets).length
      });
      await zeDeploySnapshotToEdge(snapshot);

      logEvent({
        level: 'info',
        action: 'build:deploy:done',
        message: `build deployed in ${Date.now() - zeStart}ms`
      });
    });
  });
}

module.exports = { setupZeDeploy };
