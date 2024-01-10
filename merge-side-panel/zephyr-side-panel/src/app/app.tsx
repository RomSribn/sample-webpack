import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { accessToken, setStorageListener } from './auth/refresh-token';
import { session } from './storage/session';
import { LoginButton } from './components/login-button';
import { AppControlContainer } from './containers/app-control-container';

import { useFetchAppListQuery } from './hooks/queries/use-fetch-app-list';

import { getActiveTabUrl } from './utils/get-active-tab-url';
import { tabsOnUpdated } from './utils/chrome-tabs-on-updated';

const queryClient = new QueryClient();

// this component is needed to use react-query hooks it is wrapped in QueryClientProvider
export function AppInner() {
  const { data: applications } = useFetchAppListQuery();

  const [token, setToken] = useState<string | undefined>(accessToken());
  const [currentUrl, setCurrentUrl] = useState<string | undefined>();

  if (!token) {
    session.accessToken.then(setToken);
  }

  // initial load
  useEffect(() => {
    setStorageListener();
    getActiveTabUrl().then((url) => {
      if (!url) return;
      setCurrentUrl(url);
    });

    // load app version details on change
    tabsOnUpdated((tabId, changeInfo, tab) => {
      if (tab.active && tab.url) {
        setCurrentUrl(tab.url);
      }
    });
  }, []);

  return token ? (
    <LoginButton accessToken={token}></LoginButton>
  ) : (
    currentUrl && applications && (
      <AppControlContainer
        url={currentUrl}
        applications={applications}
        accessToken={token!}
      />
    )
  );
}

export function App() {
  return (
    <div className="content-box" id="content-box">
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </div>
  );
}

export default App;
