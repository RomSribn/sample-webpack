const https = require('node:https');

const options = {
  hostname: 'ze-worker-for-static-upload.valorkin.workers.dev',
  port: 443,
  path: '/some/path',
  method: 'POST',
};

const req = https.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
