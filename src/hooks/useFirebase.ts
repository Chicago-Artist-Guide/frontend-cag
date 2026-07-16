import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { useMemo } from 'react';
import { firebaseClientConfig } from '../config/publicEnv';

const useFirebase = () => {
  const app = useMemo(() => initializeApp(firebaseClientConfig), []);
  const analytics = useMemo(() => {
    if (typeof window === 'undefined' || !firebaseClientConfig.measurementId) {
      return null;
    }

    return getAnalytics(app);
  }, [app]);
  const auth = useMemo(() => getAuth(app), [app]);
  const firestore = useMemo(() => getFirestore(app), [app]);
  const storage = useMemo(() => getStorage(app), [app]);

  return { app, analytics, auth, firestore, storage };
};

export default useFirebase;
