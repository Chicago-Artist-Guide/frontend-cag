import { useEffect, useMemo, useState } from 'react';
import {
  getFirebaseAnalytics,
  getFirebaseClient
} from '../lib/firebase/client';
import type { Analytics } from 'firebase/analytics';
import type { FirebaseClient } from '../lib/firebase/client';

const useFirebase = () => {
  const [client] = useState<FirebaseClient | null>(() =>
    typeof window === 'undefined' ? null : getFirebaseClient()
  );
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (!client) return;

    let isMounted = true;

    getFirebaseAnalytics().then((firebaseAnalytics) => {
      if (isMounted) {
        setAnalytics(firebaseAnalytics);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [client]);

  return useMemo(
    () => ({
      analytics,
      app: client?.app ?? null,
      auth: client?.auth ?? null,
      firestore: client?.firestore ?? null,
      storage: client?.storage ?? null
    }),
    [analytics, client]
  );
};

export default useFirebase;
