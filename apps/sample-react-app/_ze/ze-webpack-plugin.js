const { upload } = require('./ze-upload');
const { logEvent } = require('./ze-logger');
const { ze_dev_env } = require('./_ze-assumptions');
const pluginName = 'ZeWebpackPlugin';

// create logger with buildId
// if failed any step - stop reporting
// hook into some steps of webpack build to keep plugin clean

class ZeWebpackPlugin {
  apply(compiler) {
    const { createHash } = require('node:crypto');
    // todo: in theory this should set buildId as a query param, but it doesn't work
    const buildStartedAt = Date.now();
    compiler.hooks.beforeCompile.tapAsync(pluginName, async (params, cb) => {
      logEvent({message: 'build started'});
      cb();
    });


    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      // compilation.hooks.assetPath.tap(pluginName, replacePathVariables);

      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
          // additionalAssets: true,
        },
        async (assets) => {
          const trackZeTime = Date.now();
          const uploadableAssets = {};
          const snapshotAssets = Object.keys(assets)
            .map((key) => {
              const asset = assets[key];
              const className = asset.constructor.name;
              let buffer;
              switch (className) {
                case 'CachedSource':
                  buffer = asset._cachedBuffer;
                  break;
                case 'RawSource':
                  buffer = asset._valueAsBuffer;
                  break;
                default:
                  console.log(`unknown asset type: ${className}`);
                  return;
              }
              const hash = createHash('sha256')
                .update(buffer)
                .update(Buffer.from(key, 'utf8'))
                .digest('hex');
              uploadableAssets[hash] = {
                id: hash,
                filepath: key,
                buffer: buffer
              };
              return {
                id: hash,
                filepath: key
              };
            })
            .filter(Boolean);

          const snapshotId = createHash('sha256')
            .update(snapshotAssets
              .map(asset => asset.id).sort().join(''))
            .digest('hex');

          // const allFilenames = snapshotAssets
          //   .reduce((memo, asset) => {
          //     memo[asset.filepath] = {
          //       ...asset,
          //       id: snapshotAssets[`${assets.filepath}.gz`]
          //         ? snapshotAssets[`${assets.filepath}.gz`].id
          //         : asset.id
          //     };
          //     return memo;
          //   }, {});
          // remove files which has .gz version
          // const dedupedAssets = snapshotAssets.filter(assets => !(`${assets.filepath}.gz` in allFilenames));
          const dedupedAssets = snapshotAssets
            .filter(assets => !(assets.filepath.indexOf('.gz') > -1 ));
          // const dedupedAssets = snapshotAssets;

          const snapshot = {
            type: 'snapshot',
            id: snapshotId,

            // todo: should I decide it in webpack plugin or in worker?
            tag: `latest+${ze_dev_env.git.email}`,
            created: Date.now(),
            // todo: implement later
            creator: ze_dev_env.git,
            assets: dedupedAssets
          };

          logEvent({message: `build finished in ${Date.now() - buildStartedAt}ms`});
          logEvent({message: `uploading snapshot ${snapshot.id}`});
          const snapUploadMs = Date.now();
          const edgeTodo = await upload('snapshot', snapshot);
          edgeTodo && logEvent({message: `uploaded snapshot ${snapshot.id} in ${Date.now() - snapUploadMs}ms`});
          edgeTodo && console.log(`snapshot upload result: ${JSON.stringify(edgeTodo)}`);

          if (edgeTodo && Array.isArray(edgeTodo.assets)) {
            logEvent({message: `uploading missing ${edgeTodo?.assets?.length} from ${assets.length} assets`});
            // todo: remove when debug is done
            // edgeTodo.assets.length = 1;
            let totalTime = 0;
            await Promise.all(
              edgeTodo.assets.map((asset) => {
                const start = Date.now();
                return upload('file', uploadableAssets[asset.id])
                  .then(_ => {
                    const ms = Date.now() - start;
                    totalTime += ms;
                    console.log(`ZE: ${asset.filepath} deployed in ${ms}ms`);
                  });
              })
            );
            logEvent({message: `uploaded missing ${edgeTodo?.assets?.length} assets in ${totalTime}ms`});
            console.log(`ZE: ${edgeTodo.assets.length} chunks deployed in ${(Date.now() - trackZeTime)}ms`);
          }

          edgeTodo && logEvent({message: `deploying snapshot ${snapshot.id} as latest`});
          const latest = await upload('snapshot', {...snapshot, id: 'latest'});
          latest && logEvent({message: `deployed snapshot ${snapshot.id} as latest`});
          // todo: latest version to just deployed snapshot
          logEvent({message: `build deployed in ${Date.now() - snapUploadMs}ms`});
        }
      );
    });
  }
}

module.exports = {ZeWebpackPlugin};
