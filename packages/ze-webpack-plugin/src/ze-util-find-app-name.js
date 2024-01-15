const fs = require('node:fs');
const path = require('node:path');

function findClosestPackageJson(startPath) {
  let dir = startPath;
  while (true) {
    const packageJsonPath = path.join(dir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return fs.readFileSync(packageJsonPath, 'utf8');
    }

    const parentDir = path.resolve(dir, '..');
    if (parentDir === dir) {
      throw new Error('No package.json found');
    }
    dir = parentDir;
  }
}

function getPackageJson(context) {
  try {
    return JSON.parse(findClosestPackageJson(context || process.cwd()));
  } catch (error) {
    console.error('Error:', error.message);
    return void 0;
  }
}

function findAppName(config) {
  const mfConfig = config.plugins.find(
    (plugin) => plugin.constructor.name === 'ModuleFederationPlugin'
  );

  if (mfConfig) {
    return mfConfig._options.name;
  }

  if (!config) return this;
  const context = config.context;
  const packageJson = getPackageJson(context);
  if (packageJson && packageJson.name) {
    return packageJson.name;
  }
}

module.exports = { getPackageJson, findAppName };
