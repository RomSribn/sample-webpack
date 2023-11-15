import { conf } from '../utils/conf-storage';

function saveToken(token: string): void {
  conf.set('token', token);
}

function getToken(): string | undefined {
  return conf.get('token') as string | undefined;
}

export { saveToken, getToken };
