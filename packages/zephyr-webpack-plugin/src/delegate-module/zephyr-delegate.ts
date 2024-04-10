import {
  createFullAppName,
  ZEPHYR_API_ENDPOINT,
  getToken,
  v2_api_paths,
} from 'zephyr-edge-contract';

interface DelegateConfig {
  org: string;
  project: string;
  application: string | undefined;
}

// todo: in order to become federation impl agnostic, we should parse and provide
// already processed federation config instead of mfConfig

export async function replace_remote_in_mf_config(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mfPlugin: any,
  config: DelegateConfig,
): Promise<DelegateConfig> {
  if (!mfPlugin._options?.remotes) return config;

  // replace remotes with delegate function
  const depsResolutionTask = Object.keys(mfPlugin._options?.remotes).map(
    async (key) => {
      const [app_name, project_name, org_name] = key.split('.');
      const application_uid = createFullAppName({
        org: org_name ?? config.org,
        project: project_name ?? config.project,
        name: app_name,
      });

      // if default url is url - set as default, if not use app remote_host as default
      // if default url is not url - send it as a semver to deps resolution
      const resolvedDependency = await resolve_remote_dependency({
        name: application_uid,
        version: mfPlugin._options?.remotes[key],
      });

      async function resolve_remote_dependency({
        name,
        version,
      }: {
        name: string;
        version: string;
      }): Promise<ResolvedDependency | undefined> {
        const dashboardURL = new URL(
          v2_api_paths.dashboard_path,
          ZEPHYR_API_ENDPOINT,
        );
        dashboardURL.searchParams.append('name', name);
        dashboardURL.searchParams.append('version', version);
        try {
          const token = await getToken();
          const res = await fetch(dashboardURL, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
              Accept: 'application/json',
            },
          });

          if (!res.ok) {
            throw new Error(res.statusText);
          }
          const response = (await res.json()) as { value: ResolvedDependency };
          return response.value;
        } catch (err) {
          console.warn(
            `[zephyr] Could not resolve '${name}' with version '${version}'`,
          );
        }

        return {
          default_url: version,
          remote_entry_url: version,
          application_uid: name,
        };
      }

      if (resolvedDependency) {
        const _version = mfPlugin._options.remotes[key];
        if (_version?.indexOf('@') !== -1) {
          const [v_app] = _version.split('@');
          resolvedDependency.remote_entry_url = [
            v_app,
            resolvedDependency.remote_entry_url,
          ].join('@');
        }
        mfPlugin._options.remotes[key] =
          replace_remote_with_delegate(resolvedDependency);
      }
    },
  );

  await Promise.all(depsResolutionTask);

  return config;
}

interface ResolvedDependency {
  default_url: string;
  application_uid: string;
  remote_entry_url: string;
}

export function replace_remote_with_delegate(deps: ResolvedDependency): string {
  // prepare delegate function string template
  const fnReplace = delegate_module_template.toString();
  const strStart = new RegExp(/^function[\W\S]+return new Promise/);
  const strNewStart = `promise new Promise`;
  const strEnd = new RegExp(/;[^)}]+}$/);
  const promiseNewPromise = fnReplace
    .replace(strStart, strNewStart)
    .replace(strEnd, '');

  const { application_uid, remote_entry_url, default_url } = deps;
  return promiseNewPromise
    .replace('__APPLICATION_UID__', application_uid)
    .replace('__REMOTE_ENTRY_URL__', remote_entry_url)
    .replace('__DEFAULT_URL__', default_url);
}

function delegate_module_template(): unknown {
  return new Promise((resolve, reject) => {
    const remote_entry_url = '__REMOTE_ENTRY_URL__';
    const sessionEdgeURL = window.sessionStorage.getItem('__APPLICATION_UID__');
    let edgeUrl = sessionEdgeURL ?? remote_entry_url;
    let remote_name = '';
    if (edgeUrl.indexOf('@') !== -1) {
      [remote_name, edgeUrl] = edgeUrl.split('@') as [string, string];
    }

    const resolve_entry = [
      fetch(edgeUrl, { method: 'HEAD' })
        .then(() => edgeUrl)
        .catch(() => false),
    ];

    Promise.race(resolve_entry)
      .then((remoteUrl) => {
        if (typeof remoteUrl !== 'string') return;
        return new Function(`return import("${remoteUrl}")`)()
          .then((mod: unknown) => {
            const _win = window as unknown as Record<string, unknown>;
            if (typeof _win[remote_name] !== 'undefined') {
              return resolve(_win[remote_name]);
            }

            return resolve(mod);
          })
          .catch((err: unknown) => reject(err));
      })
      .catch((err) => {
        console.error(
          `Zephyr: error loading remote entry ${remote_entry_url}`,
          err,
        );
      });
  });
}
