import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppProviders from '../../app/providers';
import { appRouteObjects } from './app-routes';

const App = () => {
  const [router] = React.useState(() => createBrowserRouter(appRouteObjects));

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
};

export default App;
