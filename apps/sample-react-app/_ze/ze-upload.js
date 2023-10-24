const { isDev } = require('./_debug');
const { request } = require('./ze-request');
async function upload(type, body) {
  const port = isDev ? 8787 : 443;
  const hostname = isDev ? '127.0.0.1' : 'ze-worker-for-static-upload.valorkin.workers.dev';
  const data = body.buffer || JSON.stringify(body);

  const options = {
    hostname,
    port,
    path: `/upload/${type}/${body.id}?type=${type}&id=${body.id}`,
    method: 'POST',
    headers: {
      'Content-Length': data.length
    }
  };

  if (!body.buffer) {
    options.headers['Content-Type'] = 'application/json';
  } else {
    options.headers['Content-Type'] = 'application/octet';
    options.headers['x-file-path'] = body.filepath;
  }

  return request(options, data).catch(_ => void 0);
}

module.exports = { upload };
