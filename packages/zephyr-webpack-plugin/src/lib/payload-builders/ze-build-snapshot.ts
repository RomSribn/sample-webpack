import { ZeWebpackPluginOptions } from '../ze-webpack-plugin';
import {
  Snapshot,
  SnapshotAsset,
  ZeBuildAssetsMap,
} from 'zephyr-edge-contract';

export function createSnapshot(
  options: ZeWebpackPluginOptions,
  assets: ZeBuildAssetsMap,
): Snapshot {
  return {
    id: options.snapshotId,
    type: 'snapshot',
    creator: options.git,
    createdAt: Date.now(),
    mfConfig: options.mfConfig,
    assets: Object.keys(assets).reduce(
      (memo, hash: string) => {
        const asset = assets[hash];
        const { path, extname, size } = asset;
        memo[asset.path] = { path, extname, hash: asset.hash, size };
        return memo;
      },
      {} as Record<string, SnapshotAsset>,
    ),
  };
}
