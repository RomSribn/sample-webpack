import { Compiler } from 'webpack';
import { logger } from './utils/ze-log-event';
import { zeEnableSnapshotOnEdge } from './actions/ze-enable-snapshot-on-edge';
import { zeUploadSnapshot } from './actions/ze-upload-snapshot';
import { zeUploadAssets } from './actions/ze-upload-assets';
import { zeBuildAssetsMap } from './payload-builders/ze-build-assets-map';
import { createSnapshot } from './payload-builders/ze-build-snapshot';
import { ZeWebpackPluginOptions } from '../types/ze-webpack-plugin-options';
import { FederationDashboardPlugin } from '../federation-dashboard-legacy/utils/federation-dashboard-plugin/FederationDashboardPlugin';
import { zeUploadBuildStats } from './actions/ze-upload-build-stats';
import {
  getApplicationConfiguration,
  ZeUploadBuildStats,
} from 'zephyr-edge-contract';

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

        const { EDGE_URL, username, email } = await getApplicationConfiguration(
          { application_uid: pluginOptions.application_uid },
        );

        const zeStart = Date.now();
        const assetsMap = zeBuildAssetsMap(pluginOptions, assets);
        const snapshot = createSnapshot({
          options: pluginOptions,
          assets: assetsMap,
          username,
          email,
        });
        const missingAssets = await zeUploadSnapshot(
          pluginOptions,
          snapshot,
        ).catch((_) => void _);
        if (typeof missingAssets === 'undefined') return;

        const assetsUploadSuccess = await zeUploadAssets(pluginOptions, {
          missingAssets,
          assetsMap,
          count: Object.keys(assets).length,
        });
        if (!assetsUploadSuccess) return;

        // eslint-disable-next-line
        const dashboardPlugin = (pluginOptions as any)
          .dashboard as FederationDashboardPlugin;

        // todo: set proper metadata for dashboard plugin
        // eslint-disable-next-line
        dashboardPlugin.postDashboardData = async (dashData: any) => {
          dashData.app.buildId = pluginOptions.zeConfig.buildId;
          dashData.remote = pluginOptions.mfConfig?.filename;
          // todo: @valorkin remove, this should be decided on API side
          dashData.edge = { url: EDGE_URL };
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
