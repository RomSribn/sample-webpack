import open from 'open';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../utils/environment';
import { createSocket, disposeSocket } from '../utils/websocket';

export function generateSessionKey(): string {
  return uuidv4().replace(/-/g, '');
}

export interface GetPersonalAccessTokenFromWebsocketOptions {
  openBrowser?: boolean;
}

export async function getPersonalAccessTokenFromWebsocket(
  { openBrowser }: GetPersonalAccessTokenFromWebsocketOptions = {
    openBrowser: true,
  },
): Promise<string> {
  const sessionKey = generateSessionKey();
  if (openBrowser) {
    const authUrl = getAuthenticationURL({ state: sessionKey });
    await open(authUrl);
  }
  return await subscribeToWsEvents(sessionKey);
}

export interface AuthOptions {
  state: string;
  responseType?: string;
  scope?: string;
}

export function getAuthenticationURL(options: AuthOptions): string {
  const { state } = options;

  const auth0RedirectUrl = new URL(
    'authorize',
    environment.ZEPHYR_API_ENDPOINT,
  );

  const loginUrl = new URL('v2/auth/login', environment.ZEPHYR_API_ENDPOINT);
  loginUrl.searchParams.append('state', state);
  loginUrl.searchParams.append('redirect-url', auth0RedirectUrl.href);

  return loginUrl.href;
}

function subscribeToWsEvents(sessionKey: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const socket = createSocket(environment.ZEPHYR_API_ENDPOINT);

    const cleanup = () => {
      disposeSocket(socket);
    };

    socket.on('connect', () => {
      // console.debug('WS Connected');
    });

    socket.on('disconnect', () => {
      // console.debug('WS Disconnected');
      cleanup();
    });

    const roomSocket = socket.emit('joinAccessTokenRoom', {
      state: sessionKey,
    });

    roomSocket.on('access-token', (token) => {
      cleanup();
      resolve(token);
    });

    roomSocket.on('access-token-error', (msg) => {
      console.error('ERROR:', msg);
      cleanup();
      reject(new Error(msg));
    });
  });
}
