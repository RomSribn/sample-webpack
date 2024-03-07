import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

import { accessToken, setStorageListener } from './auth/refresh-token';
import { session } from './storage/session';
import { AppProvider } from './context/app-context';
import { AxiosInterceptor } from './utils/axios';

import { router } from './router';

import { getActiveTabUrl } from './utils/get-active-tab-url';
import { tabsOnUpdated } from './utils/chrome-tabs-on-updated';

// types
import { type Application } from './hooks/queries';

const queryClient = new QueryClient();

export function App() {
  const [token, setToken] = useState<string>(() => accessToken() ?? '');
  const [isDeployed, setIsDeployed] = useState<boolean>(true);
  const [url, setUrl] = useState<string | undefined>();
  const [currentApplication, setCurrentApplication] =
    useState<Application | null>(null);

  const refreshToken = () => {
    setToken(accessToken() ?? '');
  };

  if (!token) {
    session.accessToken.then(refreshToken);
  }

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
    <AxiosInterceptor>
      <QueryClientProvider client={queryClient}>
        <AppProvider
          value={{
            token,
            refreshToken,
            isDeployed,
            currentApplication,
            setIsDeployed,
            url,
            setUrl,
            serCurrentApplication: (application) =>
              setCurrentApplication(application),
          }}
        >
          <RouterProvider router={router} />
        </AppProvider>
      </QueryClientProvider>
    </AxiosInterceptor>
  );
}

export default App;
