import { ReactNode, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import classnames from 'classnames';
// containers, components
import { Navigation } from '../containers/navigation';
import { PublishButton } from '../components/publish-button';
// context, constants
import { AppContext } from '../context/app-context';
import { routeTitles } from '../router/route-names';
// hooks
import { useFetchAppVersionQuery } from '../hooks/queries/use-fetch-app-version';

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
  const { data: appVersion } = useFetchAppVersionQuery({ url });

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
