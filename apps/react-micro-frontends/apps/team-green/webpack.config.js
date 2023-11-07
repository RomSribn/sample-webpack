const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { ModuleFederationPlugin } = require('webpack').container;
const withModuleFederation = require('@nx/react/module-federation');
const { withZephyr } = require('@ze/ze-webpack-plugin');

const mfConfig = {
  name: 'team-green',
  exposes: {
    './GreenRecos': './src/app/team-green-recos.tsx'
  },
  additionalShared: ['react', 'react-dom']
};

const mfConfig2 = {
  name: 'team-green-v2',
  library: { type: 'module' },
  filename: 'remoteEntry2.js',
  exposes: {
    './GreenRecos': './src/app/team-green-recos-v2.tsx'
  }
};

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(),
  withModuleFederation(mfConfig),
  withZephyr(),
  // withModuleFederation(mfConfig2),
  (config, ctx) => {
    // config.plugins.push(new ModuleFederationPlugin(mfConfig2));
    return config;
  });
