import { useCallback, useContext, useEffect, useMemo } from 'react';

import { RemotesSelector } from './remotes-selector';
import { ApplicationTagSelector } from './application-tag-selector';
import { ApplicationSelector } from './application-selector';

import { AppContext } from '../context/app-context';
import {
  DataContext,
  PublishDataKeys,
  DataContextType,
} from '../context/data-context';

import { getActiveTabId } from '../utils';
import { useFetchAppVersionQuery } from '../hooks/queries/use-fetch-app-version';

import { ApplicationVersionSelector } from './application-version-selector';
import { Application, useApplicationList } from '../hooks/queries/application';
import {
  ApplicationTag,
  useApplicationTagList,
} from '../hooks/queries/application-tag';
import {
  ApplicationVersion,
  useApplicationVersionList,
} from '../hooks/queries/application-version';
import { navigate } from '../utils/navigate';
import { ZeAppVersion } from 'zephyr-edge-contract';

export function ApplicationContainer() {
  const { url = '', setIsDeployed, setUrl } = useContext(AppContext);
  const { application, tag, remotes, setData } = useContext(DataContext);
  const { applicationList, applicationListRefetch } = useApplicationList();
  const { applicationTagList } = useApplicationTagList(
    application?.application_uid,
  );
  const {
    applicationVersionList,
    fetchNextAppVersionListPage,
    hasNextAppVersionListPage,
  } = useApplicationVersionList({
    application_uid: application?.application_uid,
    initialPageParam: 1,
  });
  const { data: appVersion, isLoading: isAppVersionLoading } =
    useFetchAppVersionQuery({ url });

  // load app version details on change
  const onAppChange = useCallback(
    (newApplication: Application) => {
      applicationListRefetch();
      if (!applicationList) return;
      setData(newApplication, PublishDataKeys.APPLICATION);
      setUrl(newApplication.remote_host);
      navigate(newApplication.remote_host);
    },
    [applicationList, applicationListRefetch, setData, setUrl],
  );

  const onAppVersionChange = useCallback((_appVersion: ApplicationVersion) => {
    if (!_appVersion) return;
    navigate(_appVersion.remote_host);
  }, []);

  const onAppTagChange = useCallback((tag: ApplicationTag) => {
    navigate(tag.remote_host);
    return tag;
  }, []);

  const showRemotes = useMemo(() => {
    const remotes = appVersion?.remotes;
    return Array.isArray(remotes) && !!remotes.length;
  }, [appVersion]);

  const onRemoteChange = (newVal: ZeAppVersion | undefined) => {
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
          args: [newVal.application_uid, newVal.remote_entry_url],
        })
        .then(() => console.log('injected a function'));
    })();
  };

  // set remotes on the first load
  useEffect(() => {
    if (Object.keys(remotes).length) return;
    const initialRemotes = appVersion?.remotes?.reduce(
      (acc, data) => {
        if (!data) return acc;
        return { ...acc, [data.application_uid]: data as ApplicationVersion };
      },
      {} as DataContextType['remotes'],
    );
    setData(initialRemotes || {}, PublishDataKeys.REMOTES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appVersion, setData, showRemotes]);

  useEffect(() => {
    const isRemotesNotDirty =
      appVersion && showRemotes
        ? !!appVersion.remotes?.every(
            (remote) =>
              remote.version === remotes[remote.application_uid]?.version,
          )
        : true;
    const isTagNotDirty = appVersion?.tag === tag?.name;
    setIsDeployed(isRemotesNotDirty && isTagNotDirty);
  }, [tag, remotes, appVersion, showRemotes, setIsDeployed]);

  return (
    <form name="appForm">
      <ApplicationSelector
        appVersion={appVersion}
        applications={applicationList ?? []}
        onChange={onAppChange}
      />
      {application.application_uid && (
        <>
          <ApplicationTagSelector
            title="Tags"
            tags={applicationTagList ?? []}
            onAppTagChange={onAppTagChange}
            appVersion={appVersion}
            isAppVersionLoading={isAppVersionLoading}
          />
          <ApplicationVersionSelector
            applicationVersionList={applicationVersionList ?? []}
            fetchNextAppVersionListPage={fetchNextAppVersionListPage}
            hasNextAppVersionListPage={hasNextAppVersionListPage}
            onAppVersionChange={onAppVersionChange}
            appVersion={appVersion}
            isAppVersionLoading={isAppVersionLoading}
          />
        </>
      )}
      {appVersion && showRemotes && (
        <>
          <h4>Remotes</h4>
          {appVersion.remotes?.map((remote) => {
            if (!remote) {
              return null;
            }

            return (
              <RemotesSelector
                key={remote.snapshot_id}
                remoteKey={remote.application_uid}
                version={remote.version}
                remote={remote}
                onChange={onRemoteChange}
                isAppVersionLoading={isAppVersionLoading}
              />
            );
          })}
        </>
      )}
    </form>
  );
}
