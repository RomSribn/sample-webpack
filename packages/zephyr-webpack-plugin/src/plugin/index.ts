import { Compiler } from 'webpack';

// todo: replacement for ModuleFederationPlugin
// 1. read name from package.json
// 2. read version from package.json
// 3. read dependencies -> shared from package.json
// 4. read exposes from config


interface ZephyrPluginOptions {
  // by default read from package.json
  name?: string;
  // by default - remoteEntry.js
  filename?: string;
  // by default - dependencies from package.json
  shared?: string[];
  // by default - empty
  exposes?: string[];
  // by default - empty
  remotes?: string[];
}

export class ZephyrPlugin {
  constructor(options: ZephyrPluginOptions) {
    console.log('ZephyrPlugin', options);
  }

  apply(compiler: Compiler): void {
    console.log('ZephyrPlugin.apply', compiler);
  }
}