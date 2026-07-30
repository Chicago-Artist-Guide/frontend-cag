import React, { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import AdminLayout from '../components/Admin/Layout/AdminLayout';
import LegacyLayout from './LegacyLayout';

import Home from './Home';
import Donate from './Donate';
import FAQ from './FAQ';
import TOS from './TOS';
import PrivacyPolicy from './PrivacyPolicy';
import WhoWeAre from './WhoWeAre';
import TheaterResources from './TheaterResources';
import PublicRoles from './PublicRoles';
import PublicShows from './PublicShows';
import PublicShowDetail from './PublicShowDetail';
import Events from './Events';
import GetInvolved from './GetInvolved';

const Login = lazy(() => import('./Login'));
const Logout = lazy(() => import('./Logout'));
const ForgotPassword = lazy(() => import('./ForgotPassword'));
const SignUp = lazy(() => import('./SignUp'));
const Profile = lazy(() => import('./Profile'));
const Messages = lazy(() => import('./Messages'));
const ManageProduction = lazy(() => import('./ManageProduction'));
const Matches = lazy(() => import('./Matches'));
const NotFound = lazy(() => import('./NotFound'));

// Admin routes
const AdminDashboard = lazy(() => import('./admin/Dashboard'));
const AnalyticsDashboard = lazy(
  () => import('../components/Staff/Analytics/Dashboard')
);
const UserManagement = lazy(
  () => import('../components/Admin/Users/UserManagement')
);
const OpeningsManagement = lazy(
  () => import('../components/Admin/Openings/OpeningsManagement')
);
const EventsManagement = lazy(
  () => import('../components/Admin/Events/EventsManagement')
);
const CompanyManagement = lazy(
  () => import('../components/Admin/Companies/CompanyManagement')
);

export const appRouteObjects: RouteObject[] = [
  {
    element: <LegacyLayout />,
    children: [
      { path: '/', element: <Navigate to="/home" replace /> },
      { path: '/home', element: <Home /> },
      { path: '/donate', element: <Donate /> },
      { path: '/faq', element: <FAQ /> },
      { path: '/terms-of-service', element: <TOS /> },
      { path: '/privacy-policy', element: <PrivacyPolicy /> },
      { path: '/about-us', element: <WhoWeAre /> },
      { path: '/theatre-resources', element: <TheaterResources /> },
      { path: '/roles', element: <PublicRoles /> },
      { path: '/shows', element: <PublicShows /> },
      { path: '/shows/:productionId', element: <PublicShowDetail /> },
      { path: '/events', element: <Events /> },
      { path: '/get-involved', element: <GetInvolved /> },
      { path: '/login', element: <Login /> },
      { path: '/logout', element: <Logout /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/sign-up', element: <SignUp /> },
      { path: '/profile', element: <Profile /> },
      { path: '/profile/view/:accountId', element: <Profile /> },
      { path: '/profile/messages/:threadId?', element: <Messages /> },
      {
        path: '/production/:productionId/manage',
        element: <ManageProduction />
      },
      { path: '/profile/search/roles', element: <Matches /> },
      {
        path: '/profile/search/talent/:productionId/:roleId?',
        element: <Matches />
      },
      {
        path: '/analytics',
        element: <Navigate to="/admin/analytics" replace />
      },
      { path: '*', element: <NotFound /> }
    ]
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'analytics', element: <AnalyticsDashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'openings', element: <OpeningsManagement /> },
      { path: 'events', element: <EventsManagement /> },
      { path: 'companies', element: <CompanyManagement /> }
    ]
  }
];

export default appRouteObjects;
