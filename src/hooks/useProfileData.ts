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

// A setter may be called from a closure captured under a different user
// (sign-up creates the Firebase user, then publishes the documents it just
// created for that uid; logout leaves stale handlers behind). Ownership is
// decided by the document's uid, never by when the setter was captured.
const belongsToCurrentUser = (
  data: { uid?: unknown } | null | undefined,
  currentUserUid: string | undefined
) => typeof data?.uid !== 'string' || data.uid === currentUserUid;

const useProfileData = (currentUser: User | null) => {
  const currentUserUid = currentUser?.uid;
  const currentUserUidRef = useRef(currentUserUid);
  currentUserUidRef.current = currentUserUid;
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
      const [accountResult, profileResult] = await Promise.allSettled([
        findAccountByUid<AccountContextData>(currentUserUid),
        findProfileByUid<ProfileContextData>(currentUserUid)
      ]);

      if (cancelled) return;

      if (
        accountResult.status === 'fulfilled' &&
        accountRevision.current === accountLoadRevision
      ) {
        setAccountState(accountResult.value ?? emptyAccount());
      }
      if (
        profileResult.status === 'fulfilled' &&
        profileRevision.current === profileLoadRevision
      ) {
        setProfileState(profileResult.value ?? emptyProfile());
      }
    };

    void queryAccountAndProfile();

    return () => {
      cancelled = true;
    };
  }, [currentUserUid]);

  const setAccount = useCallback(
    (nextAccount: UserDocument<AccountContextData>) => {
      if (!belongsToCurrentUser(nextAccount.data, currentUserUidRef.current))
        return;
      accountRevision.current += 1;
      setAccountState(nextAccount);
    },
    []
  );
  const setAccountData = useCallback((data: AccountContextData | null) => {
    if (!belongsToCurrentUser(data, currentUserUidRef.current)) return;
    accountRevision.current += 1;
    setAccountState((previous) => ({ ...previous, data }));
  }, []);
  const setProfile = useCallback(
    (nextProfile: UserDocument<ProfileContextData>) => {
      if (!belongsToCurrentUser(nextProfile.data, currentUserUidRef.current))
        return;
      profileRevision.current += 1;
      setProfileState(nextProfile);
    },
    []
  );
  const setProfileData = useCallback((data: ProfileContextData | null) => {
    if (!belongsToCurrentUser(data, currentUserUidRef.current)) return;
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
