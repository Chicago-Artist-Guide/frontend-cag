import { createContext, useContext } from 'react';

export type ProfileContextType = {
  accountRef: any;
  setAccountRef: any;
  profileRef: any;
  setProfileRef: any;
};

export const ProfileContext = createContext<ProfileContextType>({
  accountRef: null,
  setAccountRef: () => null,
  profileRef: null,
  setProfileRef: () => null
});

export const useProfileContext = () => useContext(ProfileContext);
