// TODO: Replace with Auth0 production values
export const environment = {
  AUTH0_CLIENT_ID:
    process.env['AUTH0_CLIENT_ID'] || 'Bid9zSuXbsHFOHahQK8RlycTsEh1dJ00',
  AUTH0_DOMAIN:
    process.env['AUTH0_DOMAIN'] || 'dev-dauyheb8iq6ef5la.us.auth0.com',
  AUTH0_AUDIENCE:
    process.env['AUTH0_AUDIENCE'] ||
    'https://dev-dauyheb8iq6ef5la.us.auth0.com/api/v2/',
  ZEPHYR_API_ENDPOINT:
    process.env['ZEPHYR_API_ENDPOINT'] || 'http://localhost:3333',
  ZEPHYR_WS_ENDPOINT:
    process.env['ZEPHYR_WS_ENDPOINT'] || 'http://localhost:3333',
};

export default environment;
