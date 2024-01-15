const { logger } = require('./ze-log-event');
const { zeDeploySnapshotToEdge } = require('./ze-deploy-snapshot-to-edge');
const { zeUploadSnapshot } = require('./ze-upload-snapshot');
const { zeUploadAssets } = require('./ze-upload-assets');
const { zeBuildAssetsMap } = require('./ze-build-assets-map');
const { createSnapshot } = require('./ze-build-snapshot');

function setupZeDeploy(pluginOptions, compiler) {
  const { pluginName, zeConfig } = pluginOptions;
  const logEvent = logger(pluginOptions);

  compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
    compilation.hooks.processAssets.tapPromise(
      {
        name: pluginName,
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
      },
      async (assets) => {
        if (!zeConfig.buildId) {
          // no id - no cloud builds ;)
          return;
        }

        const zeStart = Date.now();
        const assetsMap = zeBuildAssetsMap(pluginOptions, assets);
        const snapshot = createSnapshot(pluginOptions, assetsMap);
        const missingAssets = await zeUploadSnapshot(pluginOptions, snapshot);
        // todo: exit if upload failed
        const assetsUploadSuccess = await zeUploadAssets(pluginOptions, {
          missingAssets,
          assetsMap,
          count: Object.keys(assets).length,
        });
        if (!assetsUploadSuccess) return;

        await zeDeploySnapshotToEdge(pluginOptions, snapshot);

        logEvent({
          level: 'info',
          action: 'build:deploy:done',
          message: `build deployed in ${Date.now() - zeStart}ms`,
        });
      }
    );
  });
}

module.exports = { setupZeDeploy };
