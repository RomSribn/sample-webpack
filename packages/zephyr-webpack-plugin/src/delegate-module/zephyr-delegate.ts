import { createFullAppName } from 'zephyr-edge-contract';
import { edge_endpoint } from '../config/endpoints';

// todo: should get fully qualified url in config

interface DelegateConfig {
  org: string;
  project: string;
  application: string | undefined;
}

const _toEdgeURL = (
  prefix: string,
  edge: { hostname: string; port: number },
): string => {
  return edge.port === 443
    ? `https://${prefix}.${edge.hostname}`
    : `http://${prefix}.${edge.hostname}:${edge.port}`;
};

export function replace_remote_in_mf_config(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mfPlugin: any,
  config: DelegateConfig,
): DelegateConfig {
  // replace remotes with delegate function
  Object.keys(mfPlugin._options?.remotes).forEach((key) => {
    // key could be 'app_name', 'app_name.project_name' or 'app_name.project_name.org_name'
    const [app_name, project_name, org_name] = key.split('.');
    const application_uid = createFullAppName({
      org: org_name ?? config.org,
      project: project_name ?? config.project,
      name: app_name,
    });
    const defaultUrl = mfPlugin._options?.remotes[key];
    // todo: make async call to resolve app_uid to edge_url - latest? latest tag or latest version if no latest tag
    // todo: convert default url to version dependency?
    const _config = Object.assign({}, config, {
      application: application_uid,
      application_uid: application_uid,
      // todo: fix when proper dep resolution works
      remote_entry_url: `${_toEdgeURL(application_uid, edge_endpoint)}/remoteEntry.js`,
    });
    mfPlugin._options.remotes[key] = replace_remote_with_delegate(
      defaultUrl,
      _config,
    );
  });

  return config;
}

export function replace_remote_with_delegate(
  defaultUrl: string,
  config: DelegateConfig & {
    remote_entry_url: string;
    application_uid: string;
  },
): string {
  // prepare delegate function string template
  const fnReplace = delegate_module_template.toString();
  const strStart = new RegExp(/^function[\W\S]+return new Promise/);
  const strNewStart = `promise new Promise`;
  const strEnd = new RegExp(/;[^)}]+}$/);
  const promiseNewPromise = fnReplace
    .replace(strStart, strNewStart)
    .replace(strEnd, '');

  const { application_uid, remote_entry_url } = config;
  return promiseNewPromise
    .replace('__APPLICATION_UID__', application_uid)
    .replace('__REMOTE_ENTRY_URL__', remote_entry_url)
    .replace('__DEFAULT_URL__', defaultUrl);
}

function delegate_module_template(): unknown {
  return new Promise((resolve, reject) => {
    const remote_entry_url = '__REMOTE_ENTRY_URL__';
    const sessionEdgeURL = window.sessionStorage.getItem('__APPLICATION_UID__');

    let edgeUrl = remote_entry_url;

    if (sessionEdgeURL) {
      edgeUrl = remote_entry_url;
    }

    const resolve_entry = [
      fetch(edgeUrl, { method: 'HEAD' })
        .then(() => edgeUrl)
        .catch(() => false),
    ];

    Promise.race(resolve_entry)
      .then((remoteUrl) => {
        if (typeof remoteUrl !== 'string') return;
        // @ts-expect-error using temporary _import_ holder until babel replacement is fixed
        __import__(remoteUrl)
          .then((mod: unknown) => resolve(mod))
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
