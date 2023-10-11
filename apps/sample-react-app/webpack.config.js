const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

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

class ConsoleLogOnBuildWebpackPlugin {
  apply(compiler) {
    const { createHash } = require('node:crypto');
    compiler.hooks.done.tapAsync(pluginName, async (stats) => {
      console.log('Hello World!');
    });

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
          // additionalAssets: true,
        },
        (assets) => {
          const uploadableAssets = {};
          const snapshotHashs = Object.keys(assets)
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
              return hash;
            })
            .filter(Boolean);

          const snapshotId = createHash('sha256')
            .update(snapshotHashs.sort().join(''))
            .digest('hex');

          const snapshot = {
            // 3a7c8912d49d3a61b61b1a99def03e43719e8331ca62346ccb5d4cb612782fb1
            type: 'snapshot',
            id: snapshotId,


            // todo: should I decide it in webpack plugin or in worker?
            tag: `latest+${ze_dev_env.git.email}`,
            created: Date.now(),
            // todo: implement later
            creator: ze_dev_env.git,
            assets: snapshotHashs
          };

          // todo: add support for buffer uploads
          console.log('uploading snapshot', snapshot);
          upload('snapshot', snapshot);

        }
      );
    });
  }
}


// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.optimization.realContentHash = true;
  config.plugins.push(new CompressionWebpackPlugin());
  config.plugins.push(new ConsoleLogOnBuildWebpackPlugin());
  return config;
});

function upload(type, body) {
  const isDev = true;
  const https = isDev ? require('node:http') : require('node:https');

  const port = isDev ? 8787 : 443;
  const hostname = isDev ? '127.0.0.1' : 'ze-worker-for-static-upload.valorkin.workers.dev';

  // snapshot or file
  const data = type === 'snapshot' ? JSON.stringify(body) : body.buffer;

  const options = {
    hostname,
    port,
    path: `/upload?type=${type}&id=${body.id}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
      process.stdout.write(d);
    });

    res.on('end', () => {
      console.log('\nNo more data in response.');
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.write();
  req.end();
}
