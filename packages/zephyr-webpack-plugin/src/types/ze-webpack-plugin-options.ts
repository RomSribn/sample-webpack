export interface ZeWebpackPluginOptions {
  pluginName: string;
  isCI: boolean;
  buildEnv: string;
  appName: string;
  username: string;
  zeConfig: {
    user: string;
    buildId: string | undefined;
  };
  app: {
    org: string;
    project: string;
    name: string;
    version: string;
  };
  git: {
    name: string;
    email: string;
    branch: string;
    commit: string;
  };
  mfConfig?: {
    name: string;
    filename: string;
    exposes?: Record<string, string>
    remotes?: Record<string, string>;
    shared?: Record<string, unknown>
  };
}
