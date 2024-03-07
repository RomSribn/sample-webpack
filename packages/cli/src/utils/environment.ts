// TODO: Replace with Auth0 production values

interface ApiConfig {
  AUTH0_CLIENT_ID: string;
  AUTH0_DOMAIN: string;
  ZEPHYR_API_ENDPOINT: string;
}

const api_dev_config: ApiConfig = {
  AUTH0_CLIENT_ID: 'ZsqL3PcPd5Tt2mNZimgvF5SRvvwvYqza',
  AUTH0_DOMAIN: 'zephyr-dev-eu.eu.auth0.com',
  ZEPHYR_API_ENDPOINT: 'https://api-dev.zephyr-cloud.io',
};

const api_prod_config: ApiConfig = {
  AUTH0_CLIENT_ID: 'Bid9zSuXbsHFOHahQK8RlycTsEh1dJ00',
  AUTH0_DOMAIN: 'https://dev-dauyheb8iq6ef5la.us.auth0.com',
  ZEPHYR_API_ENDPOINT: 'https://api.zephyr-cloud.io',
};

export const environment: ApiConfig = process.env['ZE_DEV']
  ? api_dev_config
  : api_prod_config;

export default environment;
