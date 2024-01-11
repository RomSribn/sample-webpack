import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';

import { session } from '../storage/session';
import { environment } from '../../environments/environment';
import { navigate } from '../utils/navigate';

const {
  AUTH0_CLIENT_ID: clientId,
  AUTH0_DOMAIN: domain,
  ZEPHYR_API_ENDPOINT: zephyrApiEndpoint,
  ZEPHYR_WS_ENDPOINT: zephyrWsEndpoint,
} = environment;

export async function isTokenValid(token: string): Promise<void> {
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
  };
  const user = await fetch(`https://${domain}/userinfo`, config);
  return new Promise<void>((resolve, reject) => {
    user.ok && user.status === 200 ? resolve() : reject();
  });
}

export async function loginWithLink(redirectUrl: string): Promise<void> {
  const state = uuidv4().replace(/-/g, '');
  const authUrl = getAuthenticationURL(state);
  await navigate(authUrl);
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

function subscribeToWsEvents(
  state: string,
  redirectUrl: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const socket = io(zephyrWsEndpoint);
    socket.on('connect', () => {
      console.debug('WS Connected');
    });

    // socket.on('exception', (data) => {});

    socket.on('disconnect', () => {
      console.debug('WSDisconnected');
    });

    const dispose = () => {
      roomSocket.disconnect();
      roomSocket.close();
      socket.disconnect();
      socket.close();
    };
    const roomSocket = socket.emit('joinAccessTokenRoom', { state });
    roomSocket.on('access-token', async (token: string) => {
      await session.setAccessToken(token);
      dispose();
      await navigate(redirectUrl);
      resolve(token);
    });
    roomSocket.on('access-token-error', (msg: string) => {
      console.error('ERROR:', msg);
      dispose();
      reject(msg);
    });
  });
}
