import { Compiler } from 'webpack';
import { logger } from './utils/ze-log-event';
import { zeEnableSnapshotOnEdge } from './upload/ze-enable-snapshot-on-edge';
import { zeUploadSnapshot } from './upload/ze-upload-snapshot';
import { zeUploadAssets } from './upload/ze-upload-assets';
import { zeBuildAssetsMap } from './payload-builders/ze-build-assets-map';
import { createSnapshot } from './payload-builders/ze-build-snapshot';
import { ZeWebpackPluginOptions } from '../types/ze-webpack-plugin-options';

export function setupZeDeploy(
  pluginOptions: ZeWebpackPluginOptions,
  compiler: Compiler,
): void {
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
        const missingAssets = await zeUploadSnapshot(
          pluginOptions,
          snapshot,
        ).catch((_) => void _);
        if (typeof missingAssets === 'undefined') return;
        // todo: exit if upload failed
        const assetsUploadSuccess = await zeUploadAssets(pluginOptions, {
          missingAssets,
          assetsMap,
          count: Object.keys(assets).length,
        });
        if (!assetsUploadSuccess) return;

        await zeEnableSnapshotOnEdge(pluginOptions, snapshot);

        logEvent({
          level: 'info',
          action: 'build:deploy:done',
          message: `build deployed in ${Date.now() - zeStart}ms`,
        });
      },
    );
  });
}
