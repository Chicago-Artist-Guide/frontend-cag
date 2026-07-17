import { User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const accountRevision = useRef(0);
  const profileRevision = useRef(0);
  const [account, setAccountState] =
    useState<UserDocument<AccountContextData>>(emptyAccount);
  const [profile, setProfileState] =
    useState<UserDocument<ProfileContextData>>(emptyProfile);

  useEffect(() => {
    let cancelled = false;
    const accountLoadRevision = ++accountRevision.current;
    const profileLoadRevision = ++profileRevision.current;

    setAccountState(emptyAccount());
    setProfileState(emptyProfile());

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

      if (accountRevision.current === accountLoadRevision) {
        setAccountState(nextAccount ?? emptyAccount());
      }
      if (profileRevision.current === profileLoadRevision) {
        setProfileState(nextProfile ?? emptyProfile());
      }
    };

    void queryAccountAndProfile();

    return () => {
      cancelled = true;
    };
  }, [currentUserUid]);

  const setAccount = useCallback(
    (nextAccount: UserDocument<AccountContextData>) => {
      accountRevision.current += 1;
      setAccountState(nextAccount);
    },
    []
  );
  const setAccountData = useCallback((data: AccountContextData | null) => {
    accountRevision.current += 1;
    setAccountState((previous) => ({ ...previous, data }));
  }, []);
  const setProfile = useCallback(
    (nextProfile: UserDocument<ProfileContextData>) => {
      profileRevision.current += 1;
      setProfileState(nextProfile);
    },
    []
  );
  const setProfileData = useCallback((data: ProfileContextData | null) => {
    profileRevision.current += 1;
    setProfileState((previous) => ({ ...previous, data }));
  }, []);

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
