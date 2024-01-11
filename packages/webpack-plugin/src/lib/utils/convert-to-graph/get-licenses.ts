/**
 * Extracts and returns the license/licenses abbrevations
 * from the respective fields.
 * @param  {Object} packageJson The package.json file content as object.
 * @return {String}
 */

export interface LocalPackageJson {
  name: string;
  version: string;
  homepage?: string;
  size?: number;
  license?: { type: string } | string;
  licenses?: Array<{ type: string }> | { type: string } | string;

  [key: string]: LocalPackageJson[keyof LocalPackageJson];
}

export function getLicenses(packageJson: LocalPackageJson): string | undefined {
  if (Array.isArray(packageJson.licenses)) {
    return packageJson.licenses
      .map((license: { type: string }) => license.type)
      .join(', ');
  }

  if (typeof packageJson.licenses !== 'string' && packageJson.licenses?.type) {
    return packageJson.licenses.type;
  }

  if (typeof packageJson.license !== 'string' && packageJson.license?.type) {
    return packageJson.license.type;
  }

  if (typeof packageJson.licenses === 'string') {
    return packageJson.licenses;
  }

  if (typeof packageJson.license === 'string') {
    return packageJson.license;
  }

  return;
}
