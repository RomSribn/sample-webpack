const { logEvent } = require('./ze-log-event');
const { uploadTags } = require('./ze-http-upload');
const { ze_dev_env } = require('./_ze-assumptions');

async function zeDeploySnapshotToEdge(snapshot, tag) {
  logEvent({
    level: 'info',
    action: 'deploy:edge:started',
    message: `started deploying local build to edge`
  });

  const deployStart = Date.now();
  const latest = await uploadTags(ze_dev_env.appName, {
    tag: tag ?? 'latest',
    snapshot: snapshot.id,
    app: ze_dev_env.appName,
    user: ze_dev_env.username
  });

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
