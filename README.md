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

build side panel:
```bash
npx nx run zephyr-side-panel:build
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

run with local edge

```bash
ZE_DEV=true npx nx run sample-webpack-application:build --watch --skip-nx-cache
```

```bash
ZE_DEV=true npx nx run-many -t build --parallel=1 --skip-nx-cache -p team-blue team-red team-green
```

prod
```bash
npx nx run-many -t build --parallel=1 --skip-nx-cache -p team-blue team-red team-green
```

```bash
ZE_DEV=true npx nx run team-green:build --skip-nx-cache --watch
```

open http://edge.lan:8787
