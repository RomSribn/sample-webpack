// todo: ze from git

const ze_dev_env = {
  isCI: false,
  get appName() {
    // todo:
    return `${this.app.org}-${this.app.project}-${this.app.name}`;
  },
  get username() {
    return this.zeConfig.user;
  },
  get snapshotId() {
    return `${this.appName}_${this.zeConfig.user}_${this.zeConfig.buildId}`;
  },
  zeConfig: {
    user: 'valorkin',
    buildId: void 0
  },
  app: {
    // from zephyr server? how current plugin does it?
    // git org
    org: '',
    // git repo
    project: '',
    // package.json name
    name: '',
  },
  // todo: what if git not configured? - skip for now
  git: {
    name: '',
    email: '',
    branch: '',
    commit: '',
  }
};

const buildEnv = ze_dev_env.isCI ? 'CI' : 'local';


module.exports = {ze_dev_env, buildEnv};
