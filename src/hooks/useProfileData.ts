import { User } from 'firebase/auth';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
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
  const setterGeneration = useMemo(() => Symbol(), [currentUserUid]);
  const activeSetterGeneration = useRef(setterGeneration);
  const accountRevision = useRef(0);
  const profileRevision = useRef(0);
  const [account, setAccountState] =
    useState<UserDocument<AccountContextData>>(emptyAccount);
  const [profile, setProfileState] =
    useState<UserDocument<ProfileContextData>>(emptyProfile);

  useLayoutEffect(() => {
    activeSetterGeneration.current = setterGeneration;
  }, [setterGeneration]);

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
      if (activeSetterGeneration.current !== setterGeneration) return;
      accountRevision.current += 1;
      setAccountState(nextAccount);
    },
    [setterGeneration]
  );
  const setAccountData = useCallback(
    (data: AccountContextData | null) => {
      if (activeSetterGeneration.current !== setterGeneration) return;
      accountRevision.current += 1;
      setAccountState((previous) => ({ ...previous, data }));
    },
    [setterGeneration]
  );
  const setProfile = useCallback(
    (nextProfile: UserDocument<ProfileContextData>) => {
      if (activeSetterGeneration.current !== setterGeneration) return;
      profileRevision.current += 1;
      setProfileState(nextProfile);
    },
    [setterGeneration]
  );
  const setProfileData = useCallback(
    (data: ProfileContextData | null) => {
      if (activeSetterGeneration.current !== setterGeneration) return;
      profileRevision.current += 1;
      setProfileState((previous) => ({ ...previous, data }));
    },
    [setterGeneration]
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
