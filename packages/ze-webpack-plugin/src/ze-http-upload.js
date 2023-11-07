const { isDev } = require('./_debug');
const { request } = require('./ze-http-request');

const port = isDev ? 8787 : 443;
const hostname = isDev ? '127.0.0.1' : 'ze-worker-for-static-upload.valorkin.workers.dev';
async function uploadFile(id, asset) {
  const type = 'file';
  const meta = {
    path: asset.path,
    extname: asset.extname,
    hash: asset.hash,
    size: asset.size,
    createdAt: Date.now()
  }

  const options = {
    hostname,
    port,
    path: `/upload?type=${type}&id=${id}`,
    method: 'POST',
    headers: {
      // 'Content-Length': asset.buffer.length
    }
  };

  // options.headers['Content-Type'] = 'application/octet';
  options.headers['x-file-path'] = asset.path;
  options.headers['x-file-meta'] = JSON.stringify(meta)

  return request(options, asset.buffer)
    .catch(err => console.warn(err));
}

async function uploadSnapshot(id, body) {
  const type = 'snapshot';
  const data = JSON.stringify(body);
  const options = {
    hostname,
    port,
    path: `/upload?type=${type}&id=${id}`,
    method: 'POST',
    headers: {
      'Content-Length': data.length
    }
  };

  options.headers['Content-Type'] = 'application/json';

  return request(options, data).catch(err => console.log(err));
}

async function uploadTags(id, body) {
  const type = 'tag';
  const data = JSON.stringify(body);
  const options = {
    hostname,
    port,
    path: `/upload?type=${type}&id=${id}`,
    method: 'POST',
    headers: {
      'Content-Length': data.length
    }
  };

  options.headers['Content-Type'] = 'application/json';

  return request(options, data).catch(err => console.log(err));
}

module.exports = { uploadSnapshot, uploadFile, uploadTags };
