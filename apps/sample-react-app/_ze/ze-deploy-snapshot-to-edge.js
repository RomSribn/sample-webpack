const { logEvent } = require('./ze-log-event');
const { ze_dev_env } = require('./_ze-assumptions');
const { upload } = require('./ze-http-upload');

async function zeDeploySnapshotToEdge(snapshot) {
  logEvent({
    level: 'info',
    action: 'deploy:edge:started',
    message: `started deploying local build to edge`
  });
  const deployStart = Date.now();
  const latest = await upload('snapshot', { ...snapshot, id: 'latest' });
  if (latest) {
    logEvent({
      level: 'info',
      action: 'deploy:edge:done',
      message: `local build deployed to edge in ${Date.now() - deployStart}ms`
    });
  } else {
    logEvent({
      level: 'error',
      action: 'deploy:edge:failed',
      message: `failed deploying local build to edge`
    });
  }
}

module.exports = { zeDeploySnapshotToEdge };
