const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const withModuleFederation = require('@nx/react/module-federation');
const { withZephyr } = require('@ze/ze-webpack-plugin');

const mfConfig = {
  name: 'team-red',
  exposes: {
    './TeamRedLayout': './src/app/team-red-layout'
  },
  remotes: ['team-green', 'team-blue'],
  additionalShared: ['react', 'react-dom']
};

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(),
  withModuleFederation(mfConfig),
  withZephyr(),
  (config) => {

    return dynmo(config);
    // return config;
  });

function dynmo(config) {
  const app = {
    org: 'valorkin',
    project: 'ze-mono',
  }
  const mfPlugin = config.plugins
    .find(plugin => plugin.constructor.name === 'ModuleFederationPlugin');
  const zePlugin = config.plugins
    .find(plugin => plugin.constructor.name === 'ZeWebpackPlugin');

  const fnReplace = replacer.toString();
  const strStart = new RegExp(/^function[\W\S]+return new Promise/);
  const strNewStart = `promise new Promise`;
  const strEnd = new RegExp(/;[^)}]+}$/);

  const promiseNewPromise = fnReplace
    .replace(strStart, strNewStart)
    .replace(strEnd, '');

  Object.keys(mfPlugin._options.remotes)
    .forEach((key) => {
      const defaultUrl = mfPlugin._options.remotes[key];
      mfPlugin._options.remotes[key] = promiseNewPromise
        .replace('_DEFAULT_URL_', defaultUrl)
        .replace('_EDGE_URL_',
          `__protocol__//${app.org}-${app.project}-${key}.__domain_and_port__/remoteEntry.js`)
        .replace('_REMOTE_APP_', key)
      ;
    });
  return config;
}

function replacer() {
  return new Promise((resolve, reject) => {
    const defaultUrl = '_DEFAULT_URL_';
    let edgeUrl = '_EDGE_URL_';
    // const remoteApp = '_REMOTE_APP_';
    let domain = getLastTwoPartsOfUrl(window.location.hostname);
    const protocol = window.location.protocol;
    const port = window.location.port;
    if (port) {
      domain += `:${port}`;
    }

    edgeUrl = edgeUrl
      .replace('__protocol__', protocol)
      .replace('__domain_and_port__', domain);

    Promise
      .race([
        // todo: do 250ms timeout
        fetch(defaultUrl, { method: 'HEAD' }).then(() => defaultUrl).catch(() => false),
        fetch(edgeUrl, { method: 'HEAD' }).then(() => edgeUrl).catch(() => false)
      ])
      .then((remoteUrl) => {
        const module = import(remoteUrl);
        module
          .then((mod) => {resolve(mod)})
          .catch((err) => {reject(err)});

      })
      .catch((err) => {
        console.log(`who cares in POC`, err);
      });

    function getLastTwoPartsOfUrl(hostname) {
      const parts = hostname.split('.'); // Splits the hostname into parts
      return parts.length > 1 ? parts.slice(-2).join('.') : hostname; // Joins the last two parts
    }
  });
}

// todo: stub component?
/*   const script = document.createElement('script');
   script.type = 'module';
   script.src = localEdge ? defaultUrl : edgeUrl;
   script.onload = (args) => {
     console.log(args)
     // the injected script has loaded and is available on window
     // we can now resolve this Promise
     const proxy = {
       get: (request) => window[remoteApp].get(request),
       init: (arg) => {
         try {
           // return window[remoteApp].init(arg)
         } catch (e) {
           console.log('remote container already initialized');
         }
       }
     };
     resolve(proxy);
   };
   // inject this script with the src set to the versioned remoteEntry.js
   document.head.appendChild(script);*/
