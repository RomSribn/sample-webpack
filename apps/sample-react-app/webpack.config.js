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
}

const ze_branch = [
  {key: 'latest', value: 'snapshot_id'},
  {key: 'latest+valorkin@gmail.com', value: 'snapshot_id'},
  {key: 'current', value: 'snapshot_id'},
]

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
      hash: '1234567890',

    }
  }
};

const CompressionWebpackPlugin = require('compression-webpack-plugin');
const {createHash} = require("node:crypto");

const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ConsoleLogOnBuildWebpackPlugin {
  apply(compiler) {
    const { createHash} = require('node:crypto');
    // compiler.hooks.done.tapAsync(pluginName, async (stats) => {
    //     console.log('Hello World!');
    // });

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
          {
            name: pluginName,
            stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
            // additionalAssets: true,
          },
          (assets) => {
              Object.keys(assets).map((key) => {
                  const hasher = createHash('sha256');
                  const asset = assets[key];
                  const className = asset.constructor.name;
                  if (className === 'CachedSource') {
                      const hash = hasher.update(asset._cachedBuffer)
                      console.log(`CachedSource: ${key} ${hash.digest('hex')}`);
                  }
                  if (className === 'RawSource') {
                      const hash = hasher.update(asset._valueAsBuffer)
                      console.log(`RawSource: ${key} ${hash.digest('hex')}`);
                  }
              })
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
