import { webpackPlugin } from './webpack-plugin';

describe('webpackPlugin', () => {
  it('should work', () => {
    expect(webpackPlugin()).toEqual('webpack-plugin');
  });
});
