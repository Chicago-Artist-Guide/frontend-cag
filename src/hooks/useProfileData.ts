import { User } from 'firebase/auth';
import {
  Firestore,
  collection,
  getDocs,
  limit,
  query,
  where
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Document } from '../context/UserContext';

const useProfileData = (currentUser: User | null, firestore: Firestore) => {
  const [account, setAccount] = useState<Document>({ ref: null, data: null });
  const [profile, setProfile] = useState<Document>({ ref: null, data: null });

  useEffect(() => {
    if (!currentUser || !firestore) return;

    const queryAccountAndProfile = async () => {
      if (!profile?.ref || !account?.ref) {
        const accountQuery = query(
          collection(firestore, 'accounts'),
          where('uid', '==', currentUser?.uid),
          limit(1)
        );
        const queryAccountSnapshot = await getDocs(accountQuery);

        const profileQuery = query(
          collection(firestore, 'profiles'),
          where('uid', '==', currentUser?.uid),
          limit(1)
        );
        const queryProfileSnapshot = await getDocs(profileQuery);

        if (!queryAccountSnapshot.empty) {
          setAccount({
            ref: queryAccountSnapshot.docs[0].ref,
            data: queryAccountSnapshot.docs[0].data()
          });
        }

        if (!queryProfileSnapshot.empty) {
          setProfile({
            ref: queryProfileSnapshot.docs[0].ref,
            data: queryProfileSnapshot.docs[0].data()
          });
        }
      }
    };

    queryAccountAndProfile();
  }, [currentUser, firestore]);

  const setAccountRef = (ref: any) => setAccount((prev) => ({ ...prev, ref }));
  const setAccountData = (data: any) =>
    setAccount((prev) => ({ ...prev, data }));
  const setProfileRef = (ref: any) => setProfile((prev) => ({ ...prev, ref }));
  const setProfileData = (data: any) =>
    setProfile((prev) => ({ ...prev, data }));

  return {
    account,
    profile,
    setAccountRef,
    setAccountData,
    setProfileRef,
    setProfileData
  };
};

export default useProfileData;
