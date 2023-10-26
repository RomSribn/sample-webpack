const { ze_dev_env } = require('./_ze-assumptions');
const { logEvent } = require('./ze-log-event');
const { zeDeploySnapshotToEdge } = require('./ze-deploy-snapshot-to-edge');
const { zeUploadSnapshot } = require('./ze-upload-snapshot');
const { zeUploadAssets } = require('./ze-upload-assets');
const { zeBuildAssetsMap } = require('./ze-build-assets-map');
const { createSnapshot } = require('./ze-build-snapshot');



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
      // todo: exit if upload failed
      const assetsUploadSuccess = await zeUploadAssets({
        missingAssets,
        assetsMap,
        count: Object.keys(assets).length
      });
      if (!assetsUploadSuccess) return;

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
