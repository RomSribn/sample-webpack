import io from "../assets/libs/socket.io.client/socket.io.js";
import { navigate } from "./utils/utils";

const uuidv4 = require('uuid').v4;
const AUTH0_CLIENT_ID = 'Bid9zSuXbsHFOHahQK8RlycTsEh1dJ00';
const AUTH0_DOMAIN = 'dev-dauyheb8iq6ef5la.us.auth0.com';
//todo change on another domain if it is needed
const ZEPHYR_API_ENDPOINT = 'http://localhost:3333';
const ZEPHYR_WS_ENDPOINT = 'http://localhost:3333';

// http://localhost:3333/user-token/generate?code=61EYjVFLm26TFj_bfYJ8kH3iOwm-MdPC8KmJh_1ku6G6H&state=66df4f5053884843a843b5c950407de5

const clientId = AUTH0_CLIENT_ID;
const domain = AUTH0_DOMAIN;
const zephyrApiEndpoint = ZEPHYR_API_ENDPOINT;
const zephyrWsEndpoint = ZEPHYR_WS_ENDPOINT;

export async function loginWithLink(redirectUrl: string): Promise<void> {
  const state = uuidv4().replace(/-/g, '');
  const authUrl = getAuthenticationURL(state);
  navigate(authUrl);
  await subscribeToWsEvents(state, redirectUrl);
}

function getAuthenticationURL(state: string): string {
  const auth0RedirectUrl = new URL('authorize', zephyrApiEndpoint);

  return [
    `https://${domain}/authorize`,
    `?response_type=code`,
    `&client_id=${clientId}`,
    `&redirect_uri=${auth0RedirectUrl.href}`,
    `&scope=openid email`,
    `&state=${state}`,
  ].join('');
}

function subscribeToWsEvents(state: string, redirectUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = io(zephyrWsEndpoint);
    socket.on('connect', () => {
      console.debug('WS Connected');
    });

    socket.on('exception', (data) => {});
    socket.on('disconnect', () => {
      console.debug('WS Disconnected');
      reject('WS Disconnected');
    });

    const dispose = () => {
      roomSocket.disconnect();
      roomSocket.close();
      socket.disconnect();
      socket.close();
    };
    const roomSocket = socket.emit('joinAccessTokenRoom', { state });
    roomSocket.on('access-token', async (token) => {
      console.log('TOKEN:', token);
      await chrome.storage.session.set({accessToken: token});
      dispose();
      navigate(redirectUrl);
      resolve(token);
    });
    roomSocket.on('access-token-error', (msg) => {
      console.error('ERROR:', msg);
      dispose();
      reject(msg);
    });
  });
}


