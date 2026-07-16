import React, { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { FirebaseContext } from '../context/FirebaseContext';
import { MarketingContext } from '../context/MarketingContext';
import { PaginationProvider } from '../context/PaginationContext';
import { UserContext } from '../context/UserContext';
import { AdminProvider } from '../context/AdminContext';
import { ErrorBoundary } from '../components/shared';
import { publicConfig } from '../config/publicEnv';
import useAuthState from '../hooks/useAuthState';
import useFirebase from '../hooks/useFirebase';
import useProfileData from '../hooks/useProfileData';
import AppRoutes from './app-routes';

import '../styles/App.scss';

const router = createBrowserRouter([{ path: '*', element: <AppRoutes /> }]);

const App = () => {
  const { app, analytics, auth, firestore, storage } = useFirebase();
  const { currentUser, setCurrentUser } = useAuthState(auth);
  const {
    account,
    profile,
    setAccountRef,
    setAccountData,
    setProfileRef,
    setProfileData
  } = useProfileData(currentUser, firestore);

  const userContextValue = useMemo(
    () => ({
      account,
      setAccountRef,
      setAccountData,
      profile,
      setProfileRef,
      setProfileData,
      currentUser,
      setCurrentUser
    }),
    [
      account,
      setAccountRef,
      setAccountData,
      profile,
      setProfileRef,
      setProfileData,
      currentUser,
      setCurrentUser
    ]
  );

  return (
    <FirebaseContext.Provider
      value={{
        firebaseApp: app,
        firebaseAnalytics: analytics,
        firebaseAuth: auth,
        firebaseFirestore: firestore,
        firebaseStorage: storage
      }}
    >
      <UserContext.Provider value={userContextValue}>
        <AdminProvider currentUser={currentUser} firestore={firestore}>
          <MarketingContext.Provider
            value={{ lglApiKey: publicConfig.lglApiKey }}
          >
            <PaginationProvider>
              <ErrorBoundary>
                <RouterProvider router={router} />
              </ErrorBoundary>
            </PaginationProvider>
          </MarketingContext.Provider>
        </AdminProvider>
      </UserContext.Provider>
    </FirebaseContext.Provider>
  );
};

export default App;
