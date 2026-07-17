import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppProviders from '../../app/providers';
import AppRoutes from './app-routes';

const router = createBrowserRouter([{ path: '*', element: <AppRoutes /> }]);

const App = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);

export default App;
