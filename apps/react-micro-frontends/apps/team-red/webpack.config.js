const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const withModuleFederation = require('@nx/react/module-federation');
const { withZephyr } = require('@ze/ze-webpack-plugin');

const mfConfig = {
  name: 'team-red',
  exposes: {
    './TeamRedLayout': './src/app/team-red-layout'
  },
  remotes: ['team-green', 'team-blue'],
  additionalShared: ['react', 'react-dom']
};

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(),
  withModuleFederation(mfConfig), withZephyr(), (config) => {
    config.plugins
      .filter(plugin => plugin.constructor.name === 'ModuleFederationPlugin')
      .forEach((plugin) => {
        // plugin._options.remotes['team-green'] = 'http://localhost:4400/remoteEntry2.js'
      });
    return config;
  });
