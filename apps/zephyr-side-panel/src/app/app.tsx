import { useCallback, useEffect, useState } from 'react';
import {
  QueryClient,
  QueryCache,
  QueryClientProvider,
} from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

import { ProviderComposer, provider } from './components/provider-compose';

import { accessToken, setStorageListener } from './auth/refresh-token';
import { logout } from './auth/authorization';
import { session } from './storage/session';

import {
  AppProvider,
  AppContextType,
  defaultState as appContextDefaultState,
} from './context/app-context';
import {
  DataProvider,
  DataContextType,
  PublishDataKeys,
  SetDataProp,
  defaultState as dataContextDefaultState,
} from './context/data-context';

import { router } from './router';

import { getActiveTabUrl } from './utils/get-active-tab-url';
import { tabsOnUpdated } from './utils/chrome-tabs-on-updated';
import { AxiosInterceptor, AxiosResponseError } from './utils/axios';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (e) => {
      if (e.name === 'AxiosError') {
        const error = e as unknown as AxiosResponseError;
        if (error?.response?.status === 403) {
          logout();
        }
      }
    },
  }),
});

export function App() {
  const [token, setToken] = useState<AppContextType['token']>(
    appContextDefaultState.token,
  );
  const [isDeployed, setIsDeployed] = useState<AppContextType['isDeployed']>(
    appContextDefaultState.isDeployed,
  );
  const [url, setUrl] = useState<AppContextType['url']>();
  const [application, setApplication] = useState<
    DataContextType[PublishDataKeys.APPLICATION]
  >(dataContextDefaultState[PublishDataKeys.APPLICATION]);
  const [tag, setTag] = useState<DataContextType[PublishDataKeys.TAG]>(
    dataContextDefaultState[PublishDataKeys.TAG],
  );
  const [version, setVersion] = useState<
    DataContextType[PublishDataKeys.VERSION]
  >(dataContextDefaultState[PublishDataKeys.VERSION]);
  const [remotes, setRemotes] = useState<
    DataContextType[PublishDataKeys.REMOTES]
  >(dataContextDefaultState[PublishDataKeys.REMOTES]);

  session.accessToken.then((token) => setToken(token));
  const refreshToken = () => {
    setToken(accessToken());
  };
  if (!token) {
    session.accessToken.then(refreshToken);
  }

  const setData = useCallback((data: SetDataProp, key: PublishDataKeys) => {
    switch (key) {
      case PublishDataKeys.APPLICATION:
        setApplication(data as DataContextType[PublishDataKeys.APPLICATION]);
        break;
      case PublishDataKeys.TAG:
        setTag(data as DataContextType[PublishDataKeys.TAG]);
        break;
      case PublishDataKeys.VERSION:
        setVersion(data as DataContextType[PublishDataKeys.VERSION]);
        break;
      case PublishDataKeys.REMOTES:
        setRemotes(data as DataContextType[PublishDataKeys.REMOTES]);
        break;
    }
  }, []);

  // initial load
  useEffect(() => {
    setStorageListener();
    getActiveTabUrl().then((url) => {
      if (!url) return;
      setUrl(url);
    });

    // load app version details on change
    tabsOnUpdated((tabId, changeInfo, tab) => {
      if (tab.active && tab.url) {
        setUrl(tab.url);
      }
    });
  }, []);

  return (
    <ProviderComposer
      providers={[
        provider(AxiosInterceptor),
        provider(QueryClientProvider, { client: queryClient }),
        provider(AppProvider, {
          value: {
            token,
            refreshToken,
            isDeployed,
            setIsDeployed,
            url,
            setUrl,
          },
        }),
        provider(DataProvider, {
          value: {
            application,
            tag,
            version,
            remotes,
            setData,
          },
        }),
      ]}
    >
      <RouterProvider router={router} />
    </ProviderComposer>
  );
}

export default App;
