import { User } from 'firebase/auth';
import { createContext, useContext } from 'react';
import type { AccountData } from '../services/accounts/types';
import type { ProfileData } from '../services/profiles/types';

export type AccountContextData = AccountData & Record<string, any>;
export type ProfileContextData = ProfileData & Record<string, any>;

export type UserDocument<TData> = {
  id: string | null;
  data: TData | null;
};

export type UserContextType = {
  account: UserDocument<AccountContextData>;
  setAccount: (account: UserDocument<AccountContextData>) => void;
  setAccountData: (data: AccountContextData | null) => void;
  profile: UserDocument<ProfileContextData>;
  setProfile: (profile: UserDocument<ProfileContextData>) => void;
  setProfileData: (data: ProfileContextData | null) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
};

const emptyAccount: UserDocument<AccountContextData> = {
  id: null,
  data: null
};
const emptyProfile: UserDocument<ProfileContextData> = {
  id: null,
  data: null
};

export const UserContext = createContext<UserContextType>({
  account: emptyAccount,
  setAccount: () => undefined,
  setAccountData: () => undefined,
  profile: emptyProfile,
  setProfile: () => undefined,
  setProfileData: () => undefined,
  currentUser: null,
  setCurrentUser: () => undefined
});

export const useUserContext = () => useContext(UserContext);
