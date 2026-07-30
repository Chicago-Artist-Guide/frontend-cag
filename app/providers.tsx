'use client';

import React, { type ReactNode, useMemo } from 'react';
import { ErrorBoundary } from '../src/components/shared';
import { AdminProvider } from '../src/context/AdminContext';
import { FirebaseContext } from '../src/context/FirebaseContext';
import { MarketingContext } from '../src/context/MarketingContext';
import { PaginationProvider } from '../src/context/PaginationContext';
import { UserContext } from '../src/context/UserContext';
import { publicConfig } from '../src/config/publicEnv';
import useAuthState from '../src/hooks/useAuthState';
import useFirebase from '../src/hooks/useFirebase';
import useProfileData from '../src/hooks/useProfileData';

interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders = ({ children }: AppProvidersProps) => {
  const { app, analytics, auth, firestore, storage } = useFirebase();
  const { currentUser, setCurrentUser } = useAuthState(auth);
  const {
    account,
    profile,
    setAccount,
    setAccountData,
    setProfile,
    setProfileData
  } = useProfileData(currentUser);
  const firebaseContextValue = useMemo(
    () => ({
      firebaseApp: app,
      firebaseAnalytics: analytics,
      firebaseAuth: auth,
      firebaseFirestore: firestore,
      firebaseStorage: storage
    }),
    [analytics, app, auth, firestore, storage]
  );
  const userContextValue = useMemo(
    () => ({
      account,
      setAccount,
      setAccountData,
      profile,
      setProfile,
      setProfileData,
      currentUser,
      setCurrentUser
    }),
    [
      account,
      setAccount,
      setAccountData,
      profile,
      setProfile,
      setProfileData,
      currentUser,
      setCurrentUser
    ]
  );

  return (
    <FirebaseContext.Provider value={firebaseContextValue}>
      <UserContext.Provider value={userContextValue}>
        <AdminProvider currentUser={currentUser} firestore={firestore}>
          <MarketingContext.Provider
            value={{ lglApiKey: publicConfig.lglApiKey }}
          >
            <PaginationProvider>
              <ErrorBoundary>{children}</ErrorBoundary>
            </PaginationProvider>
          </MarketingContext.Provider>
        </AdminProvider>
      </UserContext.Provider>
    </FirebaseContext.Provider>
  );
};

export default AppProviders;
