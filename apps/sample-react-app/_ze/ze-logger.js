const { request } = require('./ze-request');
const { isDev } = require('./_debug');
const { ze_dev_env } = require('./_ze-assumptions');

function logEvent({ appId, zeUserId, zeBuildId, logLevel, actionType, git, message, meta, createdAt }) {
  // todo: defaults
  appId ||= 'mono/sample-react-app';
  zeUserId ||= 'valorkin';
  zeBuildId ||= '1234567890';

  logLevel ||= 'debug';
  actionType ||= 'build';
  message ||= '';

  git = ze_dev_env.git;

  meta ||= {
    isCI: ze_dev_env.isCI
  };

  createdAt ||= Date.now();

  const port = isDev ? 3000 : 443;
  const hostname = isDev ? '127.0.0.1' : 'ze-worker-to-receive-logs.valorkin.workers.dev';
  const data = JSON.stringify({ appId, zeUserId, zeBuildId, logLevel, actionType, git, message, meta, createdAt });

  const options = {
    hostname,
    port,
    path: `/logs`,
    method: 'POST',
    headers: {
      'Content-Length': data.length
    }
  };

  const log = isDev ? v => console.log(v) : _ => void 0;
  request(options, data).then(log).catch(log);
}

module.exports = { logEvent };
