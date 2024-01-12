import { ZeWebpackPluginOptions } from './ze-webpack-plugin';
import { ZeBuildAssetsMap } from './ze-build-assets-map';

export interface Snapshot {
  id: string;
  type: string;
  creator: {
    email: string;
    name: string;
  };
  createdAt: number;
  mfConfig: unknown;
  assets: Record<string, SnapshotAsset>;
}

interface SnapshotAsset {
  path: string;
  extname: string;
  hash: string;
  size: number;
}

export function createSnapshot(
  options: ZeWebpackPluginOptions,
  assets: ZeBuildAssetsMap
): Snapshot {
  return {
    id: options.snapshotId,
    type: 'snapshot',
    creator: options.git,
    createdAt: Date.now(),
    mfConfig: options.mfConfig,
    assets: Object.keys(assets).reduce((memo, hash: string) => {
      const asset = assets[hash];
      const { path, extname, size } = asset;
      memo[asset.path] = { path, extname, hash: asset.hash, size };
      return memo;
    }, {} as Record<string, SnapshotAsset>),
  };
}
