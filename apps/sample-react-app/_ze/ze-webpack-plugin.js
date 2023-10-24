const { upload } = require('./ze-upload');
const { logEvent } = require('./ze-logger');
const { ze_dev_env } = require('./_ze-assumptions');
const pluginName = 'ZeWebpackPlugin';

const buildEnv = ze_dev_env.isCI ? 'CI' : 'local';

// create logger with buildId
// if failed any step - stop reporting
// hook into some steps of webpack build to keep plugin clean

function logBuild(compiler) {
  const buildStartedAt = Date.now();
  compiler.hooks
    .beforeCompile.tapAsync(pluginName, async (params, cb) => {
    logEvent({
      logLevel: 'info',
      actionType: 'build:started',
      message: `${buildEnv} build started`
    });
    cb();
  });
  compiler.hooks
    .done.tapAsync(pluginName, async () => {
    logEvent({
      logLevel: 'info',
      actionType: 'build:done',
      message: `${buildEnv} build finished in ${Date.now() - buildStartedAt}ms`
    });
  });
  compiler.hooks
    .failed.tap(pluginName, (err) => {
    logEvent({
      logLevel: 'error',
      actionType: 'build:failed',
      message: `${buildEnv} build failed in ${Date.now() - buildStartedAt}ms}`,
      meta: { error: err.toString() }
    });
  });

  return { buildStartedAt };
}

class ZeWebpackPlugin {
  apply(compiler) {
    const { createHash } = require('node:crypto');
    // todo: in theory this should set buildId as a query param, but it doesn't work
    logBuild(compiler);

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      // compilation.hooks.assetPath.tap(pluginName, replacePathVariables);

      compilation.hooks.processAssets.tapPromise({
        name: pluginName, stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
        // additionalAssets: true,
      }, async (assets) => {
        const trackZeTime = Date.now();
        const uploadableAssets = {};
        const snapshotAssets = Object.keys(assets)
          .map((key) => {
            const asset = assets[key];
            const className = asset.constructor.name;
            let buffer;
            switch (className) {
              case 'CachedSource':
                buffer = asset._cachedBuffer ?? asset._cachedSource;
                break;
              case 'RawSource':
                buffer = asset._valueAsBuffer ?? asset._valueAsString;
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
              id: hash, filepath: key, buffer: buffer
            };
            return {
              id: hash, filepath: key
            };
          })
          .filter(Boolean);

        const snapshotId = createHash('sha256')
          .update(snapshotAssets
            .map(asset => asset.id).sort().join(''))
          .digest('hex');

        const snapshot = {
          type: 'snapshot', id: snapshotId,

          // todo: should I decide it in webpack plugin or in worker?
          tag: `latest+${ze_dev_env.git.email}`, created: Date.now(), // todo: implement later
          creator: ze_dev_env.git, assets: snapshotAssets
        };

        logEvent({
          actionType: 'snapshot:upload:started',
          message: `started uploading of ${buildEnv} snapshot to zephyr`
        });

        // todo: maybe unblock build and upload in parallel
        const snapUploadMs = Date.now();
        const edgeTodo = await upload('snapshot', snapshot);
        if (!edgeTodo) {
          logEvent({
            logLevel: 'error',
            actionType: 'snapshot:upload:failed',
            message: `failed uploading of ${buildEnv} snapshot to zephyr`
          });
          return;
        }

        logEvent({
          logLevel: 'info',
          actionType: 'snapshot:upload:done',
          message: `uploaded ${buildEnv} snapshot ${snapshot.id} in ${Date.now() - snapUploadMs}ms`
        });

        if (edgeTodo && Array.isArray(edgeTodo.assets)) {
          logEvent({
            logLevel: 'info',
            actionType: 'snapshot:assets:upload:started',
            message: `uploading missing assets to zephyr (${edgeTodo?.assets?.length} from ${assets.length})`
          });

          // todo: remove when debug is done
          // edgeTodo.assets.length = 1;
          let totalTime = 0;
          await Promise
            .all(edgeTodo.assets.map((asset) => {
              const start = Date.now();
              return upload('file', uploadableAssets[asset.id])
                .then(_ => {
                  const ms = Date.now() - start;
                  totalTime += ms;
                  console.log(`ZE: ${asset.filepath} deployed in ${ms}ms`);
                });
            }))
            .catch((err) => {
              logEvent({
                logLevel: 'error',
                actionType: 'snapshot:assets:upload:failed',
                message: `failed uploading missing assets to zephyr`,
                meta: { error: err.toString() }
              })
            });

          logEvent({
            logLevel: 'info',
            actionType: 'snapshot:assets:upload:done',
            message: `uploaded missing assets to zephyr (${edgeTodo?.assets?.length} assets in ${totalTime}ms)`
          });
        }

        logEvent({
          message: `deploying snapshot ${snapshot.id} as latest`
        });
        const latest = await upload('snapshot', { ...snapshot, id: 'latest' });
        latest && logEvent({
          message: `deployed snapshot ${snapshot.id} as latest`
        });
        // todo: latest version to just deployed snapshot
        logEvent({
          message: `build deployed in ${Date.now() - snapUploadMs}ms`
        });
      });
    });
  }
}

module.exports = { ZeWebpackPlugin };
