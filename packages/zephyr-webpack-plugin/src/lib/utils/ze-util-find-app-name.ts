import { existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

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

interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
}

export function getPackageJson(
  context: string | undefined,
): PackageJson | undefined {
  const packageJson = findClosestPackageJson(context || process.cwd());
  if (!packageJson) return void 0;
  try {
    return JSON.parse(packageJson);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // todo: logger
    console.error('Error:', error?.message);
    return void 0;
  }
}
