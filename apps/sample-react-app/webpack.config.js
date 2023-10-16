const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

const isDev = false;

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
const { createHash } = require('node:crypto');
const https = require('node:https');
const { hostname } = require('os');

const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ZeWebpackPlugin {
  apply(compiler) {
    const { createHash } = require('node:crypto');
    // compiler.hooks.done.tapAsync(pluginName, async (stats) => {
    // console.log('Hello World!');
    // });

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
          // additionalAssets: true,
        },
        async (assets, ...rest) => {
          console.log(rest);
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

          const edgeTodo = await upload('snapshot', snapshot);
          console.log(`snapshot upload result: ${JSON.stringify(edgeTodo)}`);
          if (Array.isArray(edgeTodo.assets)) {
            // todo: remove when debug is done
            // edgeTodo.assets.length = 1;
            const responses = await Promise.all(
              edgeTodo.assets.map((asset) => {
                const start = Date.now();
                return upload('file', uploadableAssets[asset.id])
                  .then((response) => {
                    console.log(`ZE: ${asset.filepath} deployed in ${(Date.now() - start)}ms`);
                  });
              })
            );

            console.log(`ZE: ${edgeTodo.assets.length} chunks deployed in ${(Date.now() - trackZeTime)}ms`);
          }

          const latest = await upload('snapshot', {...snapshot, id: 'latest'});
          console.log(`latest upload result: ${JSON.stringify(latest)}`);
          // todo: latest version to just deployed snapshot
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
  config.plugins.push(new ZeWebpackPlugin());
  return config;
});

async function upload(type, body) {
  return new Promise((resolve, reject) => {

    const https = isDev ? require('node:http') : require('node:https');

    const port = isDev ? 8787 : 443;
    const hostname = isDev ? '127.0.0.1' : 'ze-worker-for-static-upload.valorkin.workers.dev';

    // snapshot or file
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

    const req = https.request(options, (res) => {
      let response = [];
      res.on('data', (d) => {
        response.push(d);
      });

      res.on('end', () => {
        const _response = Buffer.concat(response)?.toString();
        try {
          resolve(JSON.parse(_response));
        } catch {
          resolve(_response);
        }
      });
    });

    req.on('error', (e) => {
      console.error(e);
      return reject(e);
    });

    req.write(data);
    req.end();
  });
}
