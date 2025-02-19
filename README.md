# main parts

1. chrome side panel
2. terminal cli for login
3. webpack build plugin
4. deprecate: zephyr-api
5. examples folder
6. lib: zephyr-edge-contract with shared types
7. CloudFlare edge worker: ze-worker-to-generate-build-id - to generate build id
8. CloudFlare edge worker: ze-worker-for-static-upload - to upload and serve files

## How to work with different envs

- locally `ZE_API=http://localhost:3333`
- dev `ZE_API=https://api-dev.zephyr-cloud.io`

## demo tasks on prod

```bash
npx nx run sample-webpack-application:build --watch --skip-nx-cache
```

```bash
npx nx run sample-webpack-application:build --watch --skip-nx-cache
```

```bash
npx nx run-many -t build --parallel=1 --skip-nx-cache --verbose -p team-blue team-green team-red
```

```bash
npx nx run team-green:build --skip-nx-cache --watch
```

## How to run locally

- install dependencies
- setup local dns (once)
- run local edge
- run local zephyr-api\ui
- deprecate: run local event server
- run one of sample apps (sample-webpack-app or react-micro-frontends)

## configure local dns for local edge

Local DNS proxy to make wildcard links work locally (\*.edge.lan)

- for win [Acrylic DNS Proxy](https://mayakron.altervista.org/support/acrylic/Home.htm)
- for mac

```bash
brew install dnsmasq
sudo brew services start dnsmasq
```

add to Acrylic hosts:

- `127.0.0.1 edge.lan *.edge.lan`

`npm ci`

## side panel:

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

working locally with verdaccio

```bash
# terminal 1
npm run registry

#termianl 2
npx nx run zephyr-webpack-plugin:build
npm publish dist/libs/zephyr-edge-contract
npm publish dist/libs/zephyr-webpack-plugin
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
  }
);
```

### npm publish

bump versions -> do commit

```bash
npm run build-libs
```

```bash
npm publish dist/libs/zephyr-edge-contract
npm publish dist/libs/zephyr-webpack-plugin
npm publish dist/libs/zephyr-agent
npm publish dist/libs/rollup-plugin-zephyr
```

```bash
npm pack dist/libs/zephyr-edge-contract
npm pack dist/libs/zephyr-webpack-plugin
npm pack dist/libs/rollup-plugin-zephyr
npm pack dist/libs/zephyr-agent
```

## rebuild for vite

```bash
npm run build-libs
npm pack dist/libs/rollup-plugin-zephyr
npm pack dist/libs/zephyr-agent
cd dist/libs/zephyr-agent
npm pack ../zephyr-edge-contract
npm i ./zephyr-edge-contract-0.0.10.tgz
```
