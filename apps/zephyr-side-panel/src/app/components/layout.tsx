import { ReactNode, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import classnames from 'classnames';
// containers, components
import { Navigation } from '../containers/navigation';
import { PublishButton } from '../components/publish-button';
// context, constants
import { AppContext } from '../context/app-context';
import { DataContext, PublishDataKeys } from '../context/data-context';
import { routeTitles } from '../router/route-names';
// hooks
import { useFetchAppVersionQuery } from '../hooks/queries/use-fetch-app-version';
import { useApplicationList } from '../hooks/queries/application';

interface AppControlContainerProps {
  children: ReactNode;
  auth: boolean;
}
/**
 * Layout component with navigation and publish button.
 */
export function Layout({ children, auth }: Readonly<AppControlContainerProps>) {
  const location = useLocation();
  const { isDeployed, url = '' } = useContext(AppContext);
  const { application, setData } = useContext(DataContext);
  const { data: appVersion } = useFetchAppVersionQuery({ url });
  const { applicationList } = useApplicationList();

  if (
    appVersion &&
    applicationList &&
    application.application_uid !== appVersion.application_uid
  ) {
    const [, project, org] = appVersion.application_uid.split('.');
    setData(
      {
        application_uid: appVersion.application_uid,
        remote_host: appVersion.remote_host,
        name: appVersion.name,
        project: { name: project },
        organization: { name: org },
      },
      PublishDataKeys.APPLICATION,
    );
  }
  const deployStatus = useMemo(
    () => (isDeployed ? 'success' : 'warning'),
    [isDeployed],
  );

  return (
    <div className={classnames('content-box', { auth })} id="content-box">
      <Navigation
        title={routeTitles[location.pathname as keyof typeof routeTitles]}
        deployStatus={appVersion ? deployStatus : undefined}
      />
      {children}
      <div id="action-btn-block" className="action-btn-block">
        <PublishButton disabled={isDeployed} />
      </div>
    </div>
  );
}
