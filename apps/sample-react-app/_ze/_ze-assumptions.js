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

const ze_branch = [
  { key: 'latest', value: 'snapshot_id' },
  { key: 'latest+valorkin@gmail.com', value: 'snapshot_id' },
  { key: 'current', value: 'snapshot_id' }
];

// todo: ze snapshot sample
const ze_snapshot = {
  id: '1234567890',
  // date.now
  createdAt: Date.now(),
  creator: {
    name: 'Dmitriy Shekhovtsov',
    email: 'valorkin@gmail.com'
  },
  assets: {
    filepath: {
      // sha256 content hash
      hash: '1234567890'

    }
  }
};

module.exports = {ze_branch, ze_snapshot, ze_dev_env, buildEnv};
