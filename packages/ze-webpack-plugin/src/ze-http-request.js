const { isDev } = require('./_debug');
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

module.exports = { request };
