// This file can be replaced during build by using the `fileReplacements` array.
// When building for production, this file is replaced with `environment.prod.ts`.

import { envValue } from './env-value';

envValue.value = {
  production: false,
  ZEPHYR_UI: 'http://localhost:3000',
  AUTH0_CLIENT_ID: 'ZsqL3PcPd5Tt2mNZimgvF5SRvvwvYqza',
  AUTH0_DOMAIN: 'zephyr-dev-eu.eu.auth0.com',
  ZEPHYR_API_ENDPOINT: 'http://localhost:3333',
};
