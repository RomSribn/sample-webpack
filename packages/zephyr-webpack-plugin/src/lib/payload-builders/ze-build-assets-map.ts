import { logger } from '../utils/ze-log-event';
import { Source, ZeBuildAsset, ZeBuildAssetsMap } from 'zephyr-edge-contract';
import { getZeBuildAsset } from '../../utils/get-ze-build-asset';
import { ZeWebpackPluginOptions } from '../../types/ze-webpack-plugin-options';
import { onIndexHtmlResolved } from '../../hacks/resolve-index-html';

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

export async function zeBuildAssetsMap(
  pluginOptions: ZeWebpackPluginOptions,
  assets: Record<string, Source>
): Promise<ZeBuildAssetsMap> {
  const logEvent = logger(pluginOptions);

  const buildAssetMap = Object.keys(assets).reduce((memo, filepath) => {
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

    const assetMap = getZeBuildAsset({ filepath, content: buffer });
    memo[assetMap.hash] = assetMap;

    return memo;
  }, {} as ZeBuildAssetsMap);

  if (pluginOptions.wait_for_index_html) {
    const index_html_content = await onIndexHtmlResolved();
    const index_html_asset = getZeBuildAsset({
      filepath: 'index.html',
      content: index_html_content,
    });
    buildAssetMap[index_html_asset.hash] = index_html_asset;
  }

  return buildAssetMap;
}
