import { User } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import {
  AccountContextData,
  ProfileContextData,
  UserDocument
} from '../context/UserContext';
import { findAccountByUid } from '../services/accounts/client';
import { findProfileByUid } from '../services/profiles/client';

const emptyAccount = (): UserDocument<AccountContextData> => ({
  id: null,
  data: null
});
const emptyProfile = (): UserDocument<ProfileContextData> => ({
  id: null,
  data: null
});

const useProfileData = (currentUser: User | null) => {
  const currentUserUid = currentUser?.uid;
  const [account, setAccount] =
    useState<UserDocument<AccountContextData>>(emptyAccount);
  const [profile, setProfile] =
    useState<UserDocument<ProfileContextData>>(emptyProfile);

  useEffect(() => {
    let cancelled = false;

    setAccount(emptyAccount());
    setProfile(emptyProfile());

    if (!currentUserUid) {
      return () => {
        cancelled = true;
      };
    }

    const queryAccountAndProfile = async () => {
      const [nextAccount, nextProfile] = await Promise.all([
        findAccountByUid<AccountContextData>(currentUserUid),
        findProfileByUid<ProfileContextData>(currentUserUid)
      ]);

      if (cancelled) return;

      setAccount(nextAccount ?? emptyAccount());
      setProfile(nextProfile ?? emptyProfile());
    };

    void queryAccountAndProfile();

    return () => {
      cancelled = true;
    };
  }, [currentUserUid]);

  const setAccountData = useCallback(
    (data: AccountContextData | null) =>
      setAccount((previous) => ({ ...previous, data })),
    []
  );
  const setProfileData = useCallback(
    (data: ProfileContextData | null) =>
      setProfile((previous) => ({ ...previous, data })),
    []
  );

  return {
    account,
    profile,
    setAccount,
    setAccountData,
    setProfile,
    setProfileData
  };
};

export default useProfileData;
