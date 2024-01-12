import { extname } from 'node:path';
import { createHash } from 'node:crypto';
import { logger, LoggerOptions } from './ze-log-event';
import { Asset } from 'webpack';

type Source = Asset['source'];

export interface ZeBuildAsset {
  path: string;
  extname: string;
  hash: string;
  size: number;
  buffer: Buffer | string;
}

export interface ZeBuildAssetsMap {
  [key: string]: ZeBuildAsset;
}

function getAssetType(asset: Source): string {
  return asset.constructor.name;
}

function extractBuffer(asset: Source): Buffer | string | undefined {
  const className = getAssetType(asset);
  switch (className) {
    case 'CachedSource':
    case 'CompatSource':
    case 'RawSource':
    case 'ConcatSource':
      return asset?.buffer && asset.buffer();
    case 'ReplaceSource':
      return asset.source();
    default:
      return void 0;
  }
}

export function zeBuildAssetsMap(
  pluginOptions: LoggerOptions,
  assets: Record<string, Source>
): ZeBuildAssetsMap {
  const logEvent = logger(pluginOptions);

  return Object.keys(assets).reduce((memo, filepath) => {
    const asset = assets[filepath];
    const buffer = extractBuffer(asset);

    if (!buffer) {
      logEvent({
        action: 'ze:build:assets:unknown-asset-type',
        level: 'error',
        message: `unknown asset type: ${getAssetType(asset)}`,
      });
      return memo;
    }

    const hash = createHash('sha256')
      .update(buffer.length ? buffer : Buffer.from(filepath, 'utf8'))
      .update(Buffer.from(filepath, 'utf8'))
      .digest('hex');

    // todo: update worker
    memo[hash] = {
      path: filepath,
      extname: extname(filepath),
      hash,
      size: buffer.length,
      buffer: buffer,
    };
    return memo;
  }, {} as ZeBuildAssetsMap);
}
