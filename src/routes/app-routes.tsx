import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/layout';

import Home from './Home';
import Donate from './Donate';
import FAQ from './FAQ';
import TOS from './TOS';
import PrivacyPolicy from './PrivacyPolicy';
import WhoWeAre from './WhoWeAre';
import TheaterResources from './TheaterResources';
import PublicShows from './PublicShows';
import PublicShowDetail from './PublicShowDetail';
import Events from './Events';

const Login = lazy(() => import('./Login'));
const Logout = lazy(() => import('./Logout'));
const ForgotPassword = lazy(() => import('./ForgotPassword'));
const SignUp = lazy(() => import('./SignUp'));
const Profile = lazy(() => import('./Profile'));
const Messages = lazy(() => import('./Messages'));
const ManageProduction = lazy(() => import('./ManageProduction'));
const Matches = lazy(() => import('./Matches'));
const NotFound = lazy(() => import('./NotFound'));

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms-of-service" element={<TOS />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/about-us" element={<WhoWeAre />} />
        <Route path="/theatre-resources" element={<TheaterResources />} />
        <Route path="/shows" element={<PublicShows />} />
        <Route path="/shows/:productionId" element={<PublicShowDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/messages/:threadId?" element={<Messages />} />
        <Route
          path="/production/:productionId/manage"
          element={<ManageProduction />}
        />
        <Route path="/profile/search/roles" element={<Matches />} />
        <Route
          path="/profile/search/talent/:productionId/:roleId?"
          element={<Matches />}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
