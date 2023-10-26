// todo: ze from git

const ze_dev_env = {
  isCI: false,
  get appName() {
    return `${this.app.org}/${this.app.project}/${this.app.name}`;
  },
  get username() {
    return this.git.name;
  },
  get snapshotId() {
    return `${this.appName}/${this.zeConfig.buildId}`;
  },
  zeConfig: {
    user: 'valorin',
    buildId: void 0
  },
  app: {
    // from zephyr server? how current plugin does it?
    // package.json name
    name: 'sample-react-app',
    // git repo
    project: 'ze-mono',
    // git org
    org: 'valorkin',
  },
  // todo: what if git not configured? - skip for now
  git: {
    name: 'Dmitriy Shekhovtsov',
    email: 'valorkin@gmail.com',
    branch: 'master',
    commit: '1234567890',
  }
};

const buildEnv = ze_dev_env.isCI ? 'CI' : 'local';


module.exports = {ze_dev_env, buildEnv};
