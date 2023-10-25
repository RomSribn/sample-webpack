const { ze_dev_env } = require('./_ze-assumptions');
const { logEvent } = require('./ze-log-event');
const { zeDeploySnapshotToEdge } = require('./ze-deploy-snapshot-to-edge');
const { zeUploadSnapshot } = require('./ze-upload-snapshot');
const { zeUploadAssets } = require('./ze-upload-assets');
const { zeBuildAssetsMap } = require('./ze-build-assets-map');

function createSnapshot(snapshotAssets) {
  return  {
    type: 'snapshot',
    id: ze_dev_env.zeConfig.buildId,

    // todo: should I decide it in webpack plugin or in worker?
    tag: `latest+${ze_dev_env.git.email}`, created: Date.now(), // todo: implement later
    creator: ze_dev_env.git, assets: snapshotAssets
  };
}

function setupZeDeploy(pluginName, compiler) {
  compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {

    compilation.hooks.processAssets.tapPromise({
      name: pluginName, stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
      // additionalAssets: true,
    }, async (assets) => {
      if (!ze_dev_env.zeConfig.buildId) {
        // no id - no cloud builds ;)
        return;
      }

      const zeStart = Date.now();
      // todo: update assetsMap and check how ze ui object looks like
      const {uploadableAssets, snapshotAssets} = zeBuildAssetsMap(assets);
      const snapshot = createSnapshot(snapshotAssets);
      const missingAssets = await zeUploadSnapshot(snapshot);
      await zeUploadAssets({
        missingAssets,
        uploadableAssets,
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
