Local DNS proxy to make wildcard links work locally (\*.edge.lan)

- for win [Acrylic DNS Proxy](https://mayakron.altervista.org/support/acrylic/Home.htm)
- for mac

```bash
brew install dnsmasq
sudo brew services start dnsmasq
```

add to Acrylic hosts:

- `127.0.0.1 edge.lan *.edge.lan *.*.*.*.edge.lan`

`npm ci`

build side panel:

```bash
npx nx run zephyr-side-panel:build:development
```

set pg_url for ze_api, ask @valorkin or make your own

```bash
# start logger server
npx nx run zephyr-api:serve
```

```bash
# start local edge
npx nx run ze-worker-for-static-upload:start
```

clean workers cache for demo

```bash
rm -rf ./workers/.wrangler
```

```bash
ZE_DEV=local npx dist/packages/cli login
```

run with local edge

```bash
ZE_DEV=local npx nx run sample-webpack-application:build --watch --skip-nx-cache
```

```bash
ZE_DEV=local npx nx run-many -t build --parallel=1 --skip-nx-cache -p team-blue team-green team-red
```

```bash
ZE_DEV=local npx nx run team-green:build --skip-nx-cache --watch
```

open http://edge.lan:8787

prod

```bash
npx nx run-many -t build --parallel=1 --skip-nx-cache -p team-blue team-red team-green
```

working locally with verdaccio

```bash
# terminal 1
npm run registry

#termianl 2
npx nx run zephyr-webpack-plugin:build
npm publish dist/libs/zephyr-edge-contract
npm publish dist/packages/zephyr-webpack-plugin
```

set `ZE_DEV=local` for terminal

```bash
#terminal 3
# react webpack
npm create nx-workspace
cd your-new-folder
npm i -D zephyr-webpack-plugin
git remote add origin git@github.com:valorkin/demo.git
```

add to webpack config

```js
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
// import withZephyr
const { withZephyr } = require('zephyr-webpack-plugin');

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx(),
  withReact(),
  // use with zephyr
  withZephyr(),
  (config) => {
    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`
    return config;
  },
);
```
