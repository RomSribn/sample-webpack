import { getApplicationConfiguration, Source } from 'zephyr-edge-contract';
import { zeBuildAssetsMap } from '../payload-builders/ze-build-assets-map';
import { createSnapshot } from '../payload-builders/ze-build-snapshot';
import { zeUploadSnapshot } from '../actions/ze-upload-snapshot';
import { zeUploadAssets } from '../actions/ze-upload-assets';
import { zeUploadBuildStats } from '../actions/ze-upload-build-stats';
import { zeEnableSnapshotOnEdge } from '../actions/ze-enable-snapshot-on-edge';
import { ZeWebpackPluginOptions } from '../../types/ze-webpack-plugin-options';
import { logger } from '../utils/ze-log-event';
import { Stats, StatsCompilation } from 'webpack';
import * as process from 'node:process';
import { emitDeploymentDone } from './lifecycle-events';
import { getDashboardData } from '../../federation-dashboard-legacy/get-dashboard-data';

process.on('message', zephyr_agent);

export interface ZephyrAgentProps {
  stats: Stats;
  stats_json: StatsCompilation;
  pluginOptions: ZeWebpackPluginOptions;
  assets: Record<string, Source>;
}

export async function zephyr_agent({
  stats,
  stats_json,
  assets,
  pluginOptions,
}: ZephyrAgentProps): Promise<void> {
  const logEvent = logger(pluginOptions);
  const { EDGE_URL, username, email } = await getApplicationConfiguration({
    application_uid: pluginOptions.application_uid,
  });

  const zeStart = Date.now();
  const assetsMap = await zeBuildAssetsMap(pluginOptions, assets);
  const snapshot = createSnapshot({
    options: pluginOptions,
    assets: assetsMap,
    username,
    email,
  });
  const missingAssets = await zeUploadSnapshot(pluginOptions, snapshot).catch(
    (_) => void _
  );
  if (typeof missingAssets === 'undefined') return;

  const assetsUploadSuccess = await zeUploadAssets(pluginOptions, {
    missingAssets,
    assetsMap,
    count: Object.keys(assets).length,
  });
  if (!assetsUploadSuccess) return;

  // eslint-disable-next-line
  const dashData = getDashboardData({
    stats,
    stats_json,
    assets,
    pluginOptions,
    EDGE_URL,
  });
  const envs = await zeUploadBuildStats(dashData);

  if (!envs) return;

  await zeEnableSnapshotOnEdge(pluginOptions, snapshot, envs.value);

  logEvent({
    level: 'info',
    action: 'build:deploy:done',
    message: `build deployed in ${Date.now() - zeStart}ms`,
  });

  emitDeploymentDone();
}
