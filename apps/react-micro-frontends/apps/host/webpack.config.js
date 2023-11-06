const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const withModuleFederation = require('@nx/react/module-federation');

const mfConfig = {
  name: 'host',
  remotes: ['team-red'],
  additionalShared: ['react', 'react-dom']
};

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), withModuleFederation(mfConfig), (config) => {
  return config;
});
