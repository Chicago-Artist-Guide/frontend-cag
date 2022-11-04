import { DocumentReference } from '@firebase/firestore';
import { createContext, useContext } from 'react';

export type Document = {
  ref: DocumentReference | null;
  data: any;
};

export type ProfileContextType = {
  account: Document;
  setAccountData: (x: any) => void;
  setAccountRef: (x: DocumentReference | null) => void;
  profile: Document;
  setProfileData: (x: any) => void;
  setProfileRef: (x: DocumentReference | null) => void;
};

export const ProfileContext = createContext<ProfileContextType>({
  profile: {
    ref: null,
    data: null
  },
  setProfileRef: () => null,
  setProfileData: () => null,
  account: {
    ref: null,
    data: null
  },
  setAccountRef: () => null,
  setAccountData: () => null
});

export const useProfileContext = () => useContext(ProfileContext);
