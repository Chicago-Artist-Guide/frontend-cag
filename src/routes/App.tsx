import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { FirebaseContext } from '../context/FirebaseContext';
import { MarketingContext } from '../context/MarketingContext';
import { UserContext } from '../context/UserContext';
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
      <UserContext.Provider
        value={{
          account,
          setAccountRef,
          setAccountData,
          profile,
          setProfileRef,
          setProfileData,
          currentUser,
          setCurrentUser
        }}
      >
        <MarketingContext.Provider
          value={{ lglApiKey: import.meta.env.VITE_APP_LGL_API_KEY || '' }}
        >
          <RouterProvider router={router} />
        </MarketingContext.Provider>
      </UserContext.Provider>
    </FirebaseContext.Provider>
  );
};

export default App;
