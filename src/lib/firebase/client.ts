import 'client-only';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import { getApp, getApps, initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';
import { firebaseClientConfig } from '../../config/publicEnv';

export interface FirebaseClient {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

let firebaseClient: FirebaseClient | null = null;
let firebaseAnalyticsPromise: Promise<Analytics | null> | null = null;

export const getFirebaseClient = (): FirebaseClient => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase client services are only available in a browser');
  }

  if (firebaseClient) {
    return firebaseClient;
  }

  const app = getApps().some(({ name }) => name === '[DEFAULT]')
    ? getApp()
    : initializeApp(firebaseClientConfig);

  firebaseClient = {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app)
  };

  return firebaseClient;
};

export const getFirebaseAnalytics = (): Promise<Analytics | null> => {
  if (firebaseAnalyticsPromise) {
    return firebaseAnalyticsPromise;
  }

  if (typeof window === 'undefined' || !firebaseClientConfig.measurementId) {
    firebaseAnalyticsPromise = Promise.resolve(null);
    return firebaseAnalyticsPromise;
  }

  firebaseAnalyticsPromise = isSupported()
    .then((supported) =>
      supported ? getAnalytics(getFirebaseClient().app) : null
    )
    .catch(() => null);

  return firebaseAnalyticsPromise;
};
