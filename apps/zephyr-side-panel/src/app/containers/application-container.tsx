import { useCallback, useMemo, useContext, useEffect } from 'react';

import { RemotesSelector } from './remotes-selector';
import { ApplicationTagSelector } from './application-tag-selector';
import { ApplicationSelector } from './application-selector';

import { AppContext } from '../context/app-context';

// import { navigate } from '../utils/navigate';
import { getActiveTabId } from '../utils/get-active-tab-id';
import { useFetchAppVersionQuery } from '../hooks/queries/use-fetch-app-version';

import { ApplicationVersionSelector } from './application-version-selector';
import { ZeAppVersionItem } from 'zephyr-edge-contract';
import { Application, useApplicationList } from '../hooks/queries/application';
import {
  ApplicationTag,
  useApplicationTagList,
} from '../hooks/queries/application-tag';
import {
  ApplicationVersion,
  useApplicationVersionList,
} from '../hooks/queries/application-version';

export function ApplicationContainer() {
  const {
    url = '',
    setIsDeployed,
    serCurrentApplication,
    currentApplication,
  } = useContext(AppContext);
  const getParams = {
    organization: currentApplication?.organization.name,
    project: currentApplication?.project.name,
    application: currentApplication?.name,
  };
  const { applicationList } = useApplicationList();
  const { applicationTagList } = useApplicationTagList(getParams);
  const { applicationVersionList } = useApplicationVersionList(getParams);
  const { data: appVersion } = useFetchAppVersionQuery({ url });

  // load app version details on change
  const onAppChange = useCallback(
    (application: Application) => {
      if (!applicationList) return;
      serCurrentApplication(application);
      // const newApp = applications.find((app) => app.name === appName);

      // if (newApp?.url) {
      //   navigate(newApp.url);
      // }
    },
    [applicationList, serCurrentApplication],
  );

  const onAppVersionChange = useCallback(
    (_appVersion: ApplicationVersion) => {
      if (!_appVersion || !applicationList) return;

      const newApp = applicationList.find(
        (app) => app.name === appVersion?.app,
      );

      console.log(`on app version change ${_appVersion}`);
      if (!newApp) return;
      // const _url = new URL(newApp.url);
      // _url.hostname = `${_appVersion}.${_url.hostname
      //   .split('.')
      //   .slice(1)
      //   .join('.')}`;

      // navigate(_url.toString());
    },
    [appVersion?.app, applicationList],
  );

  const onAppTagChange = useCallback((tag: ApplicationTag) => {
    console.log('selected tag', tag);

    return tag;
  }, []);

  const showRemotes = useMemo(() => {
    const remotes = appVersion?.snapshot?.mfConfig?.remotes;
    return !(!remotes || !Object.keys(remotes).length);
  }, [appVersion]);

  const onRemoteChange = (
    newVal: { app_uid: string; remote: ZeAppVersionItem } | undefined,
  ) => {
    if (!newVal) return;

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
          args: [newVal.app_uid, newVal.remote.url],
        })
        .then(() => console.log('injected a function'));
    })();
  };

  useEffect(() => {
    if (appVersion) {
      setIsDeployed(true);
    }
  }, [appVersion, setIsDeployed]);

  return (
    <form name="appForm">
      <ApplicationSelector
        appVersion={appVersion}
        applications={applicationList ?? []}
        onChange={onAppChange}
      />
      {currentApplication && (
        <>
          <ApplicationTagSelector
            title="Tags"
            tags={applicationTagList ?? []}
            onAppTagChange={onAppTagChange}
          />
          <ApplicationVersionSelector
            applicationVersionList={applicationVersionList ?? []}
            onAppVersionChange={onAppVersionChange}
          />
        </>
      )}
      {appVersion && showRemotes && (
        <>
          <h4>Remotes</h4>
          {Object.keys(appVersion.snapshot.mfConfig.remotes).map(
            (remoteKey) => {
              const remote = appVersion.snapshot.mfConfig.remotes[remoteKey];
              if (!remote) {
                return null;
              }

              return (
                <RemotesSelector
                  key={remoteKey}
                  remoteKey={remoteKey}
                  version={remote.currentVersion}
                  remote={remote}
                  onChange={onRemoteChange}
                />
              );
            },
          )}
        </>
      )}
    </form>
  );
}
