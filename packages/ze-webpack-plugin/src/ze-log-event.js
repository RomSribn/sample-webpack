const isDev = true;
async function request(options, data, forceHttps) {
  const https =
    !forceHttps && isDev ? require('node:http') : require('node:https');
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
const log = isDev ? (v) => console.log(v) : (_) => void 0;

function logger(options) {
  return function logEvent({ level, action, message, meta }) {
    // todo: get from ze-config-provider
    const appId = options.appName;
    const zeUserId = options.zeConfig.user;
    const zeBuildId = options.zeConfig.buildId;
    const git = options.git;
    const createdAt = Date.now();

    // todo: if user not logged in - Ze does nothing
    if (!zeBuildId || !zeUserId) {
      return;
    }

    if (!level && !action) {
      throw new Error('log level and action type must be provided');
    }

    message = `[${options.appName}](${options.username})[${zeBuildId}]: ${message}`;
    meta = Object.assign({}, meta, {
      isCI: options.isCI,
      app: options.app,
      git: options.git,
    });

    const data = JSON.stringify({
      appId,
      zeUserId,
      zeBuildId,
      logLevel: level,
      actionType: action,
      git,
      message,
      meta,
      createdAt,
    });

    const reqOptions = {
      hostname,
      port,
      path: `/logs`,
      method: 'POST',
      headers: {
        'Content-Length': data.length,
      },
    };

    request(reqOptions, data).then(log).catch(log);
  };
}

module.exports = { logger };
