import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';

import { session } from '../storage/session';
import { envValue } from '../../environments/env-value';
import { navigate } from '../utils/navigate';

const {
  AUTH0_CLIENT_ID: clientId,
  AUTH0_DOMAIN: domain,
  ZEPHYR_API_ENDPOINT: zephyrApiEndpoint,
} = envValue.value;

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

export async function logout(): Promise<void> {
  const logoutUrl = new URL('v2/logout', `https://${domain}`);
  logoutUrl.searchParams.append('client_id', clientId);
  logoutUrl.searchParams.append(
    'returnTo',
    'http://edge.lan:8787/__my_app_list',
  );
  await navigate(logoutUrl.href);
  await session.removeAccessToken();
  await io(zephyrApiEndpoint).disconnect();

  return Promise.resolve();
}

function getAuthenticationURL(state: string): string {
  const auth0RedirectUrl = new URL('authorize', zephyrApiEndpoint);
  const loginUrl = new URL('v2/auth/login', zephyrApiEndpoint);
  loginUrl.searchParams.append('state', state);
  loginUrl.searchParams.append('redirect-url', auth0RedirectUrl.href);
  return loginUrl.href;
}

function subscribeToWsEvents(
  state: string,
  redirectUrl: string,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const socket = io(zephyrApiEndpoint);
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
