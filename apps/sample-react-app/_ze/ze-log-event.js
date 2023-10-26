// const { request } = require('./ze-http-request');
// const { isDev } = require('./_debug');
const { ze_dev_env } = require('./_ze-assumptions');

const isDev = true;
async function request(options, data, forceHttps) {
  const https = (!forceHttps && isDev) ? require('node:http') : require('node:https');
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let response = [];
      res.on('data', (d) => response.push(d));

      res.on('end', () => {
        const _response = Buffer.concat(response)?.toString();
        try {
          resolve(JSON.parse(_response));
        } catch {
          resolve(_response);
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

const port = isDev ? 3000 : 3000;
const hostname = isDev ? '127.0.0.1' : '127.0.0.1';
const log = isDev ? v => console.log(v) : _ => void 0;

function logEvent({ level, action, message, meta }) {

  // todo: get from ze-config-provider
  const appId = ze_dev_env.appName;
  const zeUserId = ze_dev_env.zeConfig.user;
  const zeBuildId = ze_dev_env.zeConfig.buildId;
  const git = ze_dev_env.git;
  const createdAt = Date.now();


  // todo: if user not logged in - Ze does nothing
  if (!zeBuildId || !zeUserId) {
    return;
  }

  if (!level && !action) {
    throw new Error('log level and action type must be provided');
  }

  message = `[${ze_dev_env.appName}](${ze_dev_env.username})[${zeBuildId}]: ${message}`;
  meta = Object.assign({}, meta, {
    isCI: ze_dev_env.isCI,
    app: ze_dev_env.app
    // git: ze_dev_env.git
  });

  const data = JSON.stringify({
    appId, zeUserId, zeBuildId,
    logLevel: level,
    actionType: action,
    git, message, meta, createdAt
  });

  const options = {
    hostname,
    port,
    path: `/logs`,
    method: 'POST',
    headers: {
      'Content-Length': data.length
    }
  };

  request(options, data).then(log).catch(log);
}

module.exports = { logEvent };
