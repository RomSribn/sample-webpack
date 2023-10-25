const { composePlugins, withNx, withReact } = require('@nx/rspack');
const { ZeWebpackPlugin } = require('./_ze/ze-webpack-plugin');

module.exports = composePlugins(withNx(), withReact(), (config) => {
  config.plugins.push(new ZeWebpackPlugin());
  return config;
});
