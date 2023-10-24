const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

const { ZeWebpackPlugin } = require('./_ze/ze-webpack-plugin');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  config.watch = true;
  config.plugins.push(new ZeWebpackPlugin());
  return config;
});



