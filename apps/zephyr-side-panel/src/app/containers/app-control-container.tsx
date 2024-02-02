import { useCallback, useMemo } from 'react';

import { RemotesSelector } from './remotes-selector';
import { ApplicationTagSelector } from './application-tag-selector';
import { ApplicationList, ApplicationSelector } from './application-selector';

import { DeployedBadge } from '../components/deployed-button';
import { PublishButton } from '../components/publish-button';
import { PreviewButton } from '../components/preview-button';

import { navigate } from '../utils/navigate';
import { getActiveTabId } from '../utils/get-active-tab-id';
import { useFetchAppVersionQuery } from '../hooks/queries/use-fetch-app-version';
import { ApplicationVersionSelector } from './application-version-selector';

interface AppControlContainerProps {
  url: string;
  applications: ApplicationList;
  accessToken: string;
}

export type AppInfo = {
  app: string; // aka name
  version: string;
  tag: string;
};

export function extractAppInfoFromUrl(url: string): AppInfo {
  // eg
  // http://valorkin-zephyr-mono-sample-react-app_valorkin_559.edge.loc:8787/
  // app = valorkin-zephyr-mono-sample-react-app
  // version = valorkin_559
  // tag = latest | valorkin_559 (?)
  const _url = new URL(url);
  const app = _url.hostname.split('.')[0];
  const version = _url.hostname.split('.')[1];
  const tag = _url.searchParams.get('tag') || 'latest';

  return { app, version, tag };
}

export function AppControlContainer({
  url,
  applications,
  accessToken,
}: AppControlContainerProps) {
  const { data: appVersion } = useFetchAppVersionQuery({ url });
  // TODO: fix this, help @valorkin pls
  // const appInfo = useMemo(() => extractAppInfoFromUrl(url), [url]);

  console.log('appVersions', appVersion)
  const appOptions = useMemo(() => {
    return applications.list.map((app) => app.name);
  }, [applications]);

  // load app version details on change
  const onAppChange = useCallback(
    (appName: string | undefined) => {
      if (!applications) return;
      const newApp = applications.list.find((app) => app.name === appName);

      if (newApp?.url) {
        navigate(newApp.url);
      }
    },
    [applications]
  );

  const onAppVersionChange = useCallback(
    (_appVersion: string | undefined) => {
      if (!_appVersion || !applications) return;

      const newApp = applications.list.find(
        (app) => app.name === appVersion?.app
      );

      if (!newApp) return;
      const _url = new URL(newApp.url);
      _url.hostname = `${_appVersion}.${_url.hostname
        .split('.')
        .slice(1)
        .join('.')}`;

      navigate(_url.toString());
    },
    [appVersion?.app, applications]
  );

  const showRemotes = useMemo(() => {
    return (
      appVersion?.snapshot?.mfConfig?.remotes &&
      Object.keys(appVersion.snapshot.mfConfig.remotes).length > 0 &&
      appVersion.snapshot.mfConfig.remotes[
        Object.keys(appVersion.snapshot.mfConfig.remotes)[0]
      ].versions
    );
  }, [appVersion]);

  const onRemoteChange = (
    remote:
      | { key: string; version: string; url: string; name: string }
      | undefined
  ) => {
    console.log(remote);
    if (!remote) return;
    function setSessionSetItem(key: string, value: string) {
      window.sessionStorage.setItem(key, value);
      window.location.reload();
    }

    (async () => {
      const tabId = await getActiveTabId();
      if (!tabId) return;

      chrome.scripting
        .executeScript({
          target: { tabId: tabId },
          func: setSessionSetItem,
          args: [remote.key, remote.url],
        })
        .then(() => console.log('injected a function'));
    })();
  };

  return (
    <>
      <div className="header">
        <h3>Application</h3>
        <DeployedBadge />
      </div>

      <form name="appForm">
        <ApplicationSelector
          appVersion={appVersion}
          appOptions={appOptions}
          onChange={onAppChange}
        />
        {appVersion && (
          <>
            <ApplicationTagSelector
              appVersion={appVersion}
              onAppTagChange={onAppVersionChange}
            />

            <ApplicationVersionSelector
              appVersion={appVersion}
              onAppVersionChange={onAppVersionChange}
            />

            {showRemotes && (
              <>
                <h4>Remotes</h4>
                {Object.keys(appVersion.snapshot.mfConfig.remotes).map(
                  (remoteKey) => (
                    <RemotesSelector
                      key={remoteKey}
                      remoteKey={remoteKey}
                      version={
                        appVersion.snapshot.mfConfig.remotes[remoteKey].version
                      }
                      remote={appVersion.snapshot.mfConfig.remotes[remoteKey]}
                      onChange={onRemoteChange}
                    />
                  )
                )}
              </>
            )}
          </>
        )}
        {/*<FieldSet fieldListName="appLevel" title="Name"></FieldSet>*/}
      </form>

      <div id="action-btn-block" className="action-btn-block">
        <PublishButton />
        <PreviewButton />
      </div>
    </>
  );
}
