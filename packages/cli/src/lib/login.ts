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
  const { state, responseType = 'code', scope = 'openid email' } = options;

  const auth0RedirectUrl = new URL(
    'user-token/generate',
    environment.ZEPHYR_API_ENDPOINT,
  );

  const authParams = new URLSearchParams({
    response_type: responseType,
    client_id: environment.AUTH0_CLIENT_ID,
    redirect_uri: auth0RedirectUrl.href,
    scope: scope,
    state: state,
  });

  return `https://${
    environment.AUTH0_DOMAIN
  }/authorize?${authParams.toString()}`;
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
      console.log('TOKEN:', token);
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
