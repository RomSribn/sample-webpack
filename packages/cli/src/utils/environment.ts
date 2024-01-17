// TODO: Replace with Auth0 production values
export const environment = {
  AUTH0_CLIENT_ID:
    process.env['AUTH0_CLIENT_ID'] || 'ZsqL3PcPd5Tt2mNZimgvF5SRvvwvYqza',
  AUTH0_DOMAIN: process.env['AUTH0_DOMAIN'] || 'zephyr-dev-eu.eu.auth0.com',
  ZEPHYR_API_ENDPOINT:
    process.env['ZEPHYR_API_ENDPOINT'] || 'https://api-dev.zephyr-cloud.io',
};

export default environment;
