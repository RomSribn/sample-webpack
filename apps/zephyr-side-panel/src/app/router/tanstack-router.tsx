// import { Navigate, createMemoryHistory, Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
// // components
// import { ProtectedRoute } from './private-routes';
// import { Layout } from '../components/layout';
// // containers
// import { ApplicationContainer } from '../containers/application-container';
// import { EnvironmentContainer } from '../containers/environment-container';
// // routes
// import { RouteNames } from './route-names';

// // TODO: memory history doest not work properly. Fix it before the usage.

// const history = createMemoryHistory()

// export const router = () => {
//   const rootRoute = createRootRoute({
//     component: () => <Outlet />,
//   });

//   const protectedRoute = createRoute({
//     id: 'protected_route',
//     getParentRoute: () => rootRoute,
//     component: () => <ProtectedRoute component={Outlet} />,
//   });

//   const applicationLvl = createRoute({
//     id: 'app_level_routing',
//     getParentRoute: () => protectedRoute,
//     component: () => (
//       <Layout auth>
//         <Outlet />
//       </Layout>
//     ),
//   });

//   const applicationRoutes = [
//     {
//       path: RouteNames.HOME,
//       component: () => <Navigate to={RouteNames.APPLICATION} />,
//     },
//     {
//       path: RouteNames.APPLICATION,
//       component: () => <ApplicationContainer />,
//     },
//     {
//       path: RouteNames.ENVIRONMENT,
//       component: () => <EnvironmentContainer />,
//     },
//     {
//       path: RouteNames.WHITELABELING,
//       component: () => <div>Whitelabeling</div>,
//     },
//     {
//       path: RouteNames.ABTESTING,
//       component: () => <div>AB Testing</div>,
//     },
//     {
//       path: RouteNames.DOCUMENTATION,
//       component: () => <div>Documentation</div>,
//     },
//   ].map((_route) => createRoute(Object.assign(_route, { getParentRoute: () => applicationLvl })))

//   applicationLvl.addChildren([...applicationRoutes]);
//   protectedRoute.addChildren([applicationLvl]);

//   const routeTree = rootRoute.addChildren([protectedRoute]);

//   return createRouter({
//     routeTree,
//     history,
//     defaultPreload: 'intent',
//     defaultPreloadDelay: 400,
//   });
// };
