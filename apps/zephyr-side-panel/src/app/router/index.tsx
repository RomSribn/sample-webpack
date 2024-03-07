import { createHashRouter, Outlet, Navigate } from 'react-router-dom';
// components
import { ProtectedRoute } from './private-routes';
import { Layout } from '../components/layout';
// containers
import { ApplicationContainer } from '../containers/application-container';
import { EnvironmentContainer } from '../containers/environment-container';
// routes
import { RouteNames } from './route-names';

export const router = createHashRouter([
  {
    element: <ProtectedRoute component={Outlet} />,
    children: [
      {
        element: (
          <Layout auth>
            <Outlet />
          </Layout>
        ),
        children: [
          {
            path: RouteNames.HOME,
            element: <Navigate to={RouteNames.APPLICATION} />,
          },
          {
            path: RouteNames.APPLICATION,
            element: <ApplicationContainer />,
          },
          {
            path: RouteNames.ENVIRONMENT,
            element: <EnvironmentContainer />,
          },
          {
            path: RouteNames.WHITELABELING,
            element: <div>Whitelabeling</div>,
          },
          {
            path: RouteNames.ABTESTING,
            element: <div>AB Testing</div>,
          },
          {
            path: RouteNames.DOCUMENTATION,
            element: <div>Documentation</div>,
          },
        ],
      },
    ],
  },
]);
