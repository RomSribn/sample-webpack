import { join, sep } from 'node:path';
import { readFileSync } from 'node:fs';
import { getLicenses, LocalPackageJson } from './get-licenses';
import { StatsModule } from 'webpack';

export interface Consume {
  consumingApplicationID: string;
  applicationID: string | null;
  name: string;
  usedIn: Set<string>;
}

export function modulePartOne(modules: StatsModule[] | undefined) {
  const consumes: Consume[] = [];
  const consumesByName: Record<string, Consume> = {};
  const modulesObj: Record<
    string,
    {
      id: string;
      name: string;
      applicationID: string;
      requires: string[];
      file: string;
    }
  > = {};
  const npmModules = new Map<string, Record<string, LocalPackageJson>>();

  modules?.forEach((mod) => {
    const { identifier, reasons, moduleType, nameForCondition, size } = mod;
    const data = identifier?.split(' ');

    if (moduleType === 'remote-module') {
      if (data?.length === 4) {
        const name = data[3].replace('./', '');

        let applicationID: string | null = data[2].replace(
          'webpack/container/reference/',
          '',
        );

        if (applicationID.includes('?')) {
          applicationID = new URLSearchParams(applicationID.split('?')[1]).get(
            'remoteName',
          );
        }

        const consume = {
          consumingApplicationID: name,
          applicationID,
          name,
          usedIn: new Set<string>(),
        };

        consumes.push(consume);
        if (nameForCondition) {
          consumesByName[nameForCondition] = consume;
        }
      }

      if (reasons) {
        reasons.forEach(({ userRequest, resolvedModule }) => {
          if (!userRequest || !consumesByName[userRequest] || !resolvedModule)
            return;
          const module = resolvedModule.replace('./', '');
          consumesByName[userRequest].usedIn.add(module);
        });
      }
    } else if (data && data[0] === 'container' && data[1] === 'entry') {
      JSON.parse(data[3]).forEach(
        ([prefixedName, file]: [string, { import: string[] }]) => {
          const name = prefixedName.replace('./', '');
          modulesObj[file.import[0]] = {
            id: `${name}:${name}`,
            name,
            applicationID: name,
            requires: [],
            file: file.import[0],
          };
        },
      );
    } else if (nameForCondition && nameForCondition.includes('node_modules')) {
      const contextArray = nameForCondition.split(sep);
      const afterModule = nameForCondition.split('node_modules' + sep);

      const search = afterModule[1] && afterModule[1].startsWith('@') ? 3 : 2;
      contextArray.splice(contextArray.indexOf('node_modules') + search);

      const context = contextArray.join(sep);

      const packageJsonFile = join(context, 'package.json');
      const packageJson = JSON.parse(
        readFileSync(packageJsonFile, { encoding: 'utf-8' }),
      ) as LocalPackageJson;

      const existingPackage = npmModules.get(packageJson.name);
      if (existingPackage) {
        const existingReference = existingPackage[packageJson.version];
        const data = {
          name: packageJson.name,
          version: packageJson.version,
          homepage: packageJson.homepage,
          license: getLicenses(packageJson),
          size: (Number(existingReference.size) || 0) + (size ?? 0),
        };
        if (existingReference) {
          Object.assign(existingReference, data);
        } else {
          existingPackage[packageJson.version] = data;
        }
        npmModules.set(packageJson.name, existingPackage);
      } else {
        const newDep = {
          [packageJson.version]: {
            name: packageJson.name,
            version: packageJson.version,
            homepage: packageJson.homepage,
            license: getLicenses(packageJson),
            size,
          },
        };
        npmModules.set(packageJson.name, newDep);
      }
    }
  });

  return { consumes, modulesObj, npmModules };
}
