interface DelegateConfig {
  org: string;
  project: string;
  application: string;
  edgeUrl: string;
}

// const delegate_config: DelegateConfig = {
//   org: 'valorkin',
//   project: 'zephyr-mono',
//   mfPlugin: {},
//   edgeUrl: 'cf.valorkin.dev',
// };

export function replace_remote_in_mf_config(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mfPlugin: any,
  config: DelegateConfig,
): DelegateConfig {
  // replace remotes with delegate function
  Object.keys(mfPlugin._options?.remotes).forEach((key) => {
    const defaultUrl = mfPlugin._options?.remotes[key];
    mfPlugin._options.remotes[key] = replace_remote_with_delegate(defaultUrl, config);
  });

  return config;
}

export function replace_remote_with_delegate(
  defaultUrl: string,
  config: DelegateConfig,
): string {
  // prepare delegate function string template
  const fnReplace = delegate_module_template.toString();
  const strStart = new RegExp(/^function[\W\S]+return new Promise/);
  const strNewStart = `promise new Promise`;
  const strEnd = new RegExp(/;[^)}]+}$/);
  const promiseNewPromise = fnReplace
    .replace(strStart, strNewStart)
    .replace(strEnd, '');

  const { org, project, application, edgeUrl } = config;
  return promiseNewPromise
    .replace('__REMOTE_KEY__', application)
    .replace('_DEFAULT_URL_', defaultUrl)
    .replace(
      '_EDGE_URL_',
      `__protocol__//${org}-${project}-${application}.__domain_and_port__/remoteEntry.js`,
    )
    .replace('_DEFAULT_EDGE_DOMAIN_', edgeUrl);
}

function delegate_module_template(): unknown {
  return new Promise((resolve, reject) => {
    const remoteKey = '__REMOTE_KEY__';
    const defaultUrl = '_DEFAULT_URL_';
    let edgeUrl = '_EDGE_URL_';
    const getEdgeLink = (): { protocol: string; domain: string } => {
      if (window.location.hostname === 'localhost') {
        return {
          protocol: 'https:',
          domain: '_DEFAULT_EDGE_DOMAIN_',
        };
      }

      let domain = getEdgeHost(window.location.hostname);
      const protocol = window.location.protocol;
      const port = window.location.port;
      if (port) {
        domain += `:${port}`;
      }

      return {
        protocol,
        domain,
      };
    };

    const { protocol, domain } = getEdgeLink();

    edgeUrl = edgeUrl
      .replace('__protocol__', protocol)
      .replace('__domain_and_port__', domain);

    const sessionEdgeURL = window.sessionStorage.getItem(remoteKey);

    if (sessionEdgeURL) {
      edgeUrl = sessionEdgeURL;
    }

    const resolve_entry = [
      fetch(edgeUrl, { method: 'HEAD' })
        .then(() => edgeUrl)
        .catch(() => defaultUrl),
    ];

    if (defaultUrl) {
      resolve_entry.push(
        fetch(defaultUrl, { method: 'HEAD' })
          .then(() => defaultUrl)
          .catch(() => edgeUrl),
      );
    }

    // todo: do 250ms timeout
    Promise.race(resolve_entry)
      .then((remoteUrl) =>
        import(remoteUrl)
          .then((mod) => resolve(mod))
          .catch((err) => reject(err)),
      )
      .catch((err) => {
        console.error(`Zephyr: error loading remote entry`, err);
      });

    function getEdgeHost(hostname: string): string {
      const host = hostname.split('.');
      host.shift();
      return host.join('.');
      // const regex = /^(.+?)\.(edge\.local|(cf|aws)\.valorkin\.dev)/;
      // const match = hostname.match(regex);
      // return match[2];
    }
  });
}
