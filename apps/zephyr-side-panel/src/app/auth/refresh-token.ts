import { session } from '../storage/session';
import { isTokenValid } from './authorization';

let _accessToken: string | undefined;
let intervalId: number | undefined;

/** seems like a bad idea */
export function accessToken(): string {
  return _accessToken ?? '';
}

export async function setAccessToken(token: string) {
  _accessToken = token;
  await session.setAccessToken(token);
}

export async function disableTokenRefresh() {
  _clearInterval();
  _accessToken = void 0;
  await session.removeAccessToken();
}

async function checkIsValidToken() {
  if (!_accessToken) {
    return false;
  }
  return isTokenValid(_accessToken)
    .then(() => session.setAccessToken(_accessToken))
    .catch(async (err) => {
      _clearInterval();
      await session.setAccessToken();
      // await ContentClass.setContent(_accessToken);

      console.error('error', err);
    });
}

export async function setStorageListener() {
  if (!chrome.storage) {
    return;
  }

  chrome.storage.onChanged.addListener((value) => {
    if (value.accessToken) {
      _accessToken = value.accessToken.newValue;
      // ContentClass.setContent(_accessToken);
      resetTokenRefresh();
    }
  });
}

// internals
function _clearInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = void 0;
  }
}

//todo set valid time for interval
function _setInterval() {
  if (_accessToken) {
    intervalId = window.setInterval(checkIsValidToken, 600000);
  }
}

function resetTokenRefresh() {
  _clearInterval();
  _setInterval();
}
