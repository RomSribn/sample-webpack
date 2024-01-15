/* eslint @typescript-eslint/no-explicit-any: 0 */

export interface IRemoteCurrentValue {
  [key: string]: {
    name: string;
    id: string;
  };
}

export interface ICurrentValue {
  appLevel: string;
  tagLevel: string;
  versionLevel: string;
  remoteLevel: IRemoteCurrentValue;
}

async function getItem(
  keys?: string | string[] | { [key: string]: any } | null
): Promise<{ [key: string]: any }> {
  if (!chrome.storage && typeof keys === 'string') {
    const key = window.sessionStorage.getItem(keys);
    return Promise.resolve({ [keys]: key });
  }

  return chrome.storage.session.get(keys);
}

async function setItem(keys: { [key: string]: any }): Promise<void> {
  if (!chrome.storage) {
    Object.keys(keys).forEach((key) => {
      window.sessionStorage.setItem(key, keys[key]);
    });
    return Promise.resolve();
  }

  return await chrome.storage.session.set(keys);
}

export const session = {
  get accessToken(): Promise<string> {
    return getItem('accessToken').then((res) => res.accessToken);
  },

  async setAccessToken(value?: string) {
    return await setItem({ accessToken: value });
  },

  get currentFormValues(): Promise<ICurrentValue> {
    return getItem('currentFormValues').then((res) => res.currentFormValues);
  },

  async setCurrentFormValues(value: ICurrentValue) {
    return await setItem({ currentFormValues: value });
  },
};
