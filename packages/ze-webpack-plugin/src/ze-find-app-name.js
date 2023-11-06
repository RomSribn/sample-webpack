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

module.exports = {getPackageJson};
