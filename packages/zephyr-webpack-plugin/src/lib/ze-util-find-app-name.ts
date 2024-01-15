import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { Configuration } from 'webpack';

function findClosestPackageJson(startPath: string): string | void {
  let dir = startPath;
  do {
    const packageJsonPath = join(dir, 'package.json');
    if (existsSync(packageJsonPath)) {
      return readFileSync(packageJsonPath, 'utf8');
    }

    const parentDir = resolve(dir, '..');
    if (parentDir === dir) {
      throw new Error('No package.json found');
    }
    dir = parentDir;
  } while (startPath !== dir);
}

function getPackageJson(context: string | undefined): unknown | undefined {
  const path = findClosestPackageJson(context || process.cwd());
  if (!path) return void 0;
  try {
    return JSON.parse(path);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // todo: logger
    console.error('Error:', error?.message);
    return void 0;
  }
}

export function findAppName(config: Configuration): string | undefined {
  const mfConfig = config.plugins?.find(
    (plugin) => plugin?.constructor.name === 'ModuleFederationPlugin'
  ) as { _options?: { name?: string } };

  if (mfConfig) {
    return mfConfig?._options?.name;
  }

  if (!config) return void 0;

  const context = config.context;
  const packageJson = getPackageJson(context);
  if (packageJson && packageJson.name) {
    return packageJson.name;
  }

  return void 0;
}
