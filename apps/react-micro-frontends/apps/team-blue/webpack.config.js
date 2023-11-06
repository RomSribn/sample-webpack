const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const { withModuleFederation } = require('@nx/react/module-federation');

const mfConfig = {
  name: 'team-blue',
  exposes: {
    './BlueBasket': './src/app/team-blue-basket.tsx',
    './BlueBuy': './src/app/team-blue-buy.tsx'
  },
  additionalShared: ['react', 'react-dom']
};

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(),
  withModuleFederation(mfConfig),  (config) => {
    return config;
  });
