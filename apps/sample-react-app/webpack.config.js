const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

const isDev = true;

// todo: ze wrapper should add:
// CompressionWebpackPlugin

// todo: ze from git
const ze_dev_env = {
  isCI: false,
  git: {
    name: 'Dmitriy Shekhovtsov',
    email: 'valorkin@gmail.com'
  }
};

const ze_branch = [
  { key: 'latest', value: 'snapshot_id' },
  { key: 'latest+valorkin@gmail.com', value: 'snapshot_id' },
  { key: 'current', value: 'snapshot_id' }
];

// todo: ze snapshot sample
const ze_snapshot = {
  id: '1234567890',
  // date.now
  created: '1696958761394',
  creator: {
    name: 'Dmitriy Shekhovtsov',
    email: 'valorkin@gmail.com'
  },
  assets: {
    filepath: {
      // sha256 content hash
      hash: '1234567890'

    }
  }
};

const CompressionWebpackPlugin = require('compression-webpack-plugin');
const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ZeWebpackPlugin {
  apply(compiler) {
    const { createHash } = require('node:crypto');
    // todo: in theory this should set buildId as a query param, but it doesn't work
    const buildStartedAt = Date.now();
    compiler.hooks.beforeCompile.tapAsync(pluginName, async (params, cb) => {
      logEvent({message: 'build started'});
      cb();
    });
/*    let buildId = -1;
    compiler.hooks.beforeCompile.tapAsync(pluginName, async (params, cb) => {
      buildId = (await getBuildId(ze_dev_env.git.email))[ze_dev_env.git.email];
      cb();
    });
    const replacePathVariables = (path, data, assetInfo) => {
      // todo: if [query] use `&` instead of `?`
      if (typeof path !== 'string' || path.indexOf('name') === -1) return path;
      const operand = path.indexOf('?') > -1 ? '&' : '?';
      // return path.indexOf('query') > -1 ? path : `${path}${operand}[query]`;
      console.log(path, data.filename)
      return path;
    }*/

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

          const allFilenames = snapshotAssets
            .reduce((memo, asset) => {
              memo[asset.filepath] = {
                ...asset,
                id: snapshotAssets[`${assets.filepath}.gz`]
                  ? snapshotAssets[`${assets.filepath}.gz`].id
                  : asset.id
              };
              return memo;
            }, {});
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
                  .then((response) => {
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


// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.watch = true;
  // config.optimization.realContentHash = true;
  config.plugins.push(new CompressionWebpackPlugin());
  config.plugins.unshift(new ZeWebpackPlugin());
  return config;
});


function logEvent({author, logLevel, actionType, message, json, createdAt}) {
  // todo: defaults
  author ||= ze_dev_env.git.email;
  logLevel ||= 'debug';
  actionType ||= 'build';
  message ||= '';
  json ||= {};
  createdAt ||= Date.now();

  const port = isDev ? 8855 : 443;
  const hostname = isDev ? '127.0.0.1' : 'ze-worker-to-receive-logs.valorkin.workers.dev';
  const data = JSON.stringify({author, logLevel, actionType, message, json, createdAt});

  const options = {
    hostname,
    port,
    path: `/`,
    method: 'POST',
    headers: {
      'Content-Length': data.length
    }
  };

  request(options, data).then(_ => void 0).catch(_ => void 0);
}

async function getBuildId(key) {
  const port = 443;
  const hostname = 'ze-worker-to-generate-build-id.valorkin.workers.dev';

  const options = {
    hostname,
    port,
    path: `/?key=${key}`,
    method: 'GET'
  };

  return request(options);
}

async function upload(type, body) {
  const port = isDev ? 8787 : 443;
  const hostname = isDev ? '127.0.0.1' : 'ze-worker-for-static-upload.valorkin.workers.dev';
  const data = body.buffer || JSON.stringify(body);

  const options = {
    hostname,
    port,
    path: `/upload/${type}/${body.id}?type=${type}&id=${body.id}`,
    method: 'POST',
    headers: {
      'Content-Length': data.length
    }
  };

  if (!body.buffer) {
    options.headers['Content-Type'] = 'application/json';
  } else {
    options.headers['Content-Type'] = 'application/octet';
    options.headers['x-file-path'] = body.filepath;
  }

  return request(options, data).catch(_ => void 0);
}

async function request(options, data) {
  const https = isDev ? require('node:http') : require('node:https');
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let response = [];
      res.on('data', (d) => response.push(d));

      res.on('end', () => {
        const _response = Buffer.concat(response)?.toString();
        try {
          resolve(JSON.parse(_response));
        } catch {
          resolve(_response);
        }
      });
    });

    req.on('error', (e) =>  reject(e));

    if (data) {
      req.write(data);
    }

    req.end();
  });
}
