import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from '../components/layout';

const LegacyLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

export default LegacyLayout;
