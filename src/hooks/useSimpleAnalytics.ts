import { useState, useEffect } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { useFirebaseContext } from '../context/FirebaseContext';
import { useUserContext } from '../context/UserContext';
import { STAFF_CONFIG } from '../config/staffAccess';

export const useSimpleAnalytics = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const { currentUser } = useUserContext();
  const [data, setData] = useState({
    loading: true,
    error: null as string | null,
    accountCount: 0,
    profileCount: 0,
    isStaff: false
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // First check if we have a user from context
        console.log('Current user from context:', currentUser?.email);

        if (!currentUser) {
          setData((prev) => ({
            ...prev,
            loading: false,
            error: 'Not logged in'
          }));
          return;
        }

        // Check staff access
        const email = currentUser.email?.toLowerCase() || '';
        const isStaff = STAFF_CONFIG.emails.includes(email);

        console.log('Email:', email, 'Is Staff:', isStaff);

        if (!isStaff) {
          setData((prev) => ({
            ...prev,
            loading: false,
            error: 'Not authorized - email not in staff list',
            isStaff: false
          }));
          return;
        }

        // Try a simple query with limit
        console.log('Attempting limited query...');
        const accountsQuery = query(
          collection(firebaseFirestore, 'accounts'),
          limit(5)
        );
        const accountsSnap = await getDocs(accountsQuery);

        console.log('Limited query successful, found:', accountsSnap.size);

        // If that works, try full queries
        const allAccounts = await getDocs(
          collection(firebaseFirestore, 'accounts')
        );
        const allProfiles = await getDocs(
          collection(firebaseFirestore, 'profiles')
        );

        setData({
          loading: false,
          error: null,
          accountCount: allAccounts.size,
          profileCount: allProfiles.size,
          isStaff: true
        });
      } catch (error: any) {
        console.error('Simple analytics error:', error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: `Error: ${error?.message || 'Unknown error'}`
        }));
      }
    };

    if (firebaseFirestore && currentUser) {
      checkAccess();
    }
  }, [firebaseFirestore, currentUser]);

  return data;
};
