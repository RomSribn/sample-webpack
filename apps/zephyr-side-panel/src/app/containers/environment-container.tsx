import { useCallback, useContext, useEffect } from 'react';

import { ApplicationTagSelector } from './application-tag-selector';
import { ApplicationSelector } from './application-selector';

import { AppContext } from '../context/app-context';

// import { navigate } from '../utils/navigate';
import { useFetchAppVersionQuery } from '../hooks/queries/use-fetch-app-version';
import {
  useApplicationList,
  useApplicatioEnvironmentnList,
  useApplicationTagList,
  useApplicationVersionList,
  type Application,
  type ApplicationEnvironment,
  type ApplicationTag,
  type ApplicationVersion,
} from '../hooks/queries';
import { ApplicationVersionSelector } from './application-version-selector';
import { EnvironmentSelector } from './environment-selector';

export function EnvironmentContainer() {
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
  const { applicationEnvironmentList } =
    useApplicatioEnvironmentnList(getParams);
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

  const onAppEnvironmentChange = useCallback(
    (ennvironment: ApplicationEnvironment) => {
      console.log('selected environment', ennvironment);
      return ennvironment;
    },
    [],
  );

  const onAppVersionChange = useCallback(
    (_appVersion: ApplicationVersion) => {
      if (!_appVersion || !applicationList) return;

      // const newApp = applications.find(
      //   (app) => app.name === appVersion?.app,
      // );

      // console.log(`on app version change ${_appVersion}`);
      // if (!newApp) return;
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

  useEffect(() => {
    if (appVersion) {
      setIsDeployed(true);
    }
  }, [appVersion, setIsDeployed]);

  return (
    <form name="envForm">
      <ApplicationSelector
        appVersion={appVersion}
        applications={applicationList ?? []}
        onChange={onAppChange}
      />
      {currentApplication && (
        <>
          <EnvironmentSelector
            environmentList={applicationEnvironmentList ?? []}
            onChange={onAppEnvironmentChange}
          />
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
    </form>
  );
}
