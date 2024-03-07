export interface ZephyrPluginOptions {
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
