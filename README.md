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

start local edge

```bash
npx nx run ze-worker-for-static-upload:start

cd workspace/ze-worker-for-static-upload
npm start
```

open http://edge.local:8787
