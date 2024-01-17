Local DNS proxy to make wildcard links work locally (\*.edge.local)

- for win [Acrylic DNS Proxy](https://mayakron.altervista.org/support/acrylic/Home.htm)

add to Acrylic hosts:

- `127.0.0.1 edge.local *.edge.local`

`npm ci`

set pg_url for ze_api, ask @valorkin or make your own

```bash
# start logger server
nx run zephyr-api:serve
```

```bash
# start local edge
npx nx run ze-worker-for-static-upload:start
```

clean workers cache for demo

```bash
rm -rf ./workers/.wrangler
```

sample-webpack-app

```bash
npx nx run sample-webpack-application:build --watch --skip-nx-cache
```

open http://edge.local:8787
