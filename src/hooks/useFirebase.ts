import { useEffect, useMemo, useState } from 'react';
import {
  getFirebaseAnalytics,
  getFirebaseClient
} from '../lib/firebase/client';
import type { Analytics } from 'firebase/analytics';

const useFirebase = () => {
  const client = useMemo(() => getFirebaseClient(), []);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    let isMounted = true;

    getFirebaseAnalytics().then((firebaseAnalytics) => {
      if (isMounted) {
        setAnalytics(firebaseAnalytics);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return useMemo(() => ({ ...client, analytics }), [analytics, client]);
};

export default useFirebase;
