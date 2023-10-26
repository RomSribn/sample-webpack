const { isDev } = require('./_debug');
const { request } = require('./ze-http-request');

const port = isDev ? 8787 : 443;
const hostname = isDev ? '127.0.0.1' : 'ze-worker-for-static-upload.valorkin.workers.dev';
async function upload(type, id, body) {
  const data = body.buffer || JSON.stringify(body);
  const options = {
    hostname,
    port,
    path: `/upload/${type}/${id}`,
    method: 'POST',
    headers: {
      'Content-Length': data.length
    }
  };

  if (!body.buffer) {
    options.headers['Content-Type'] = 'application/json';
  } else {
    options.headers['Content-Type'] = 'application/octet';
  }

  return request(options, data).catch(_ => void 0);
}

module.exports = { upload };
