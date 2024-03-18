import { Compiler } from 'webpack';
import { logger } from './utils/ze-log-event';
import { zeEnableSnapshotOnEdge } from './upload/ze-enable-snapshot-on-edge';
import { zeUploadSnapshot } from './upload/ze-upload-snapshot';
import { zeUploadAssets } from './upload/ze-upload-assets';
import { zeBuildAssetsMap } from './payload-builders/ze-build-assets-map';
import { createSnapshot } from './payload-builders/ze-build-snapshot';
import { ZeWebpackPluginOptions } from '../types/ze-webpack-plugin-options';
import { FederationDashboardPlugin } from '../federation-dashboard-legacy/utils/federation-dashboard-plugin/FederationDashboardPlugin';
import {
  ZeUploadBuildStats,
  zeUploadBuildStats,
} from './upload/ze-upload-build-stats';
import { edge_endpoint } from '../config/endpoints';

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

        // todo: upload app version and send JWT with env URLs to edge
        // eslint-disable-next-line
        const dashboardPlugin = (pluginOptions as any)
          .dashboard as FederationDashboardPlugin;

        // todo: set proper metadata for dashboard plugin
        // eslint-disable-next-line
        dashboardPlugin.postDashboardData = async (dashData: any) => {
          dashData.remote = pluginOptions.mfConfig?.filename;
          // todo: shouldn't be this set for app inside of ze-api?
          dashData.edge = {
            hostname: edge_endpoint.hostname,
            port: edge_endpoint.port,
          };
          return await zeUploadBuildStats(dashData);
        };

        const envs = (await dashboardPlugin.processWebpackGraph(
          compilation,
        )) as { value: ZeUploadBuildStats };
        // end of dashboard plugin hack around

        await zeEnableSnapshotOnEdge(pluginOptions, snapshot, envs.value);

        logEvent({
          level: 'info',
          action: 'build:deploy:done',
          message: `build deployed in ${Date.now() - zeStart}ms`,
        });
      },
    );
  });
}
