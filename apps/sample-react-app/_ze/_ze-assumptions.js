// todo: ze from git
const ze_dev_env = {
  isCI: false,
  git: {
    name: 'Dmitriy Shekhovtsov',
    email: 'valorkin@gmail.com',
    branch: 'master',
    commit: '1234567890',
  }
};

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

module.exports = {ze_branch, ze_snapshot, ze_dev_env};
