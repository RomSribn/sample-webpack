import { useCallback, useContext } from 'react';

import { ApplicationTagSelector } from './application-tag-selector';
import { ApplicationSelector } from './application-selector';

import { AppContext } from '../context/app-context';
import { DataContext, PublishDataKeys } from '../context/data-context';

import { navigate } from '../utils/navigate';
import { useFetchAppVersionQuery } from '../hooks/queries/use-fetch-app-version';

import { ApplicationVersionSelector } from './application-version-selector';
import { EnvironmentSelector } from './environment-selector';
import {
  ApplicationEnvironment,
  useApplicatioEnvironmentnList,
} from '../hooks/queries/application-environment';
import { Application, useApplicationList } from '../hooks/queries/application';
import {
  ApplicationTag,
  useApplicationTagList,
} from '../hooks/queries/application-tag';
import {
  ApplicationVersion,
  useApplicationVersionList,
} from '../hooks/queries/application-version';

export function EnvironmentContainer() {
  const { url = '', setUrl } = useContext(AppContext);
  const { application, setData } = useContext(DataContext);
  const { applicationList, applicationListRefetch } = useApplicationList();
  const { applicationEnvironmentList } = useApplicatioEnvironmentnList(
    application?.application_uid,
  );
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

  const onAppEnvironmentChange = useCallback(
    (ennvironment: ApplicationEnvironment) => {
      console.log('selected environment', ennvironment);
      return ennvironment;
    },
    [],
  );

  const onAppVersionChange = useCallback((_appVersion: ApplicationVersion) => {
    if (!_appVersion) return;
    navigate(_appVersion.remote_host);
  }, []);

  const onAppTagChange = useCallback((tag: ApplicationTag) => {
    navigate(tag.remote_host);
    return tag;
  }, []);

  return (
    <form name="envForm">
      <ApplicationSelector
        appVersion={appVersion}
        applications={applicationList ?? []}
        onChange={onAppChange}
      />
      {application.application_uid && (
        <>
          <EnvironmentSelector
            environmentList={applicationEnvironmentList ?? []}
            onChange={onAppEnvironmentChange}
            appVersion={appVersion}
            isAppVersionLoading={isAppVersionLoading}
          />
          <ApplicationTagSelector
            title="Tags"
            tags={applicationTagList ?? []}
            onAppTagChange={onAppTagChange}
            appVersion={appVersion}
            isAppVersionLoading={isAppVersionLoading}
          />
          <ApplicationVersionSelector
            applicationVersionList={applicationVersionList || []}
            fetchNextAppVersionListPage={fetchNextAppVersionListPage}
            hasNextAppVersionListPage={hasNextAppVersionListPage}
            onAppVersionChange={onAppVersionChange}
            appVersion={appVersion}
            isAppVersionLoading={isAppVersionLoading}
          />
        </>
      )}
    </form>
  );
}
