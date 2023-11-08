const { logger } = require('./ze-log-event');
const { uploadTags } = require('./ze-http-upload');

async function zeDeploySnapshotToEdge(pluginOptions, snapshot, tag) {
  const logEvent = logger(pluginOptions);

  logEvent({
    level: 'info',
    action: 'deploy:edge:started',
    message: `started deploying local build to edge`
  });

  const deployStart = Date.now();
  const latest = await uploadTags(pluginOptions.appName, {
    tag: tag ?? 'latest',
    snapshot: snapshot.id,
    app: pluginOptions.appName,
    user: pluginOptions.username
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
