const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const withModuleFederation = require('@nx/react/module-federation');
const { ZeWebpackPlugin } = require('@ze/ze-webpack-plugin');

const mfConfig = {
  name: 'host',
  remotes: ['team-red'],
  additionalShared: ['react', 'react-dom']
};

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), withModuleFederation(mfConfig), (config) => {
  config.plugins.push(new ZeWebpackPlugin({config}));
  return config;
});
