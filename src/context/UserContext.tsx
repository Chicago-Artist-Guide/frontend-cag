import { DocumentReference } from '@firebase/firestore';
import { User } from 'firebase/auth';
import { createContext, useContext } from 'react';

export type Document = {
  id: string | null;
  ref: DocumentReference | null;
  data: any;
};

export type UserContextType = {
  account: Document;
  setAccountData: (x: any) => void;
  setAccountRef: (x: DocumentReference | null) => void;
  profile: Document;
  setProfileData: (x: any) => void;
  setProfileRef: (x: DocumentReference | null) => void;
  currentUser: User | null;
  setCurrentUser: (x: User | null) => void;
};

export const UserContext = createContext<UserContextType>({
  profile: {
    id: null,
    ref: null,
    data: null
  },
  setProfileRef: () => null,
  setProfileData: () => null,
  account: {
    id: null,
    ref: null,
    data: null
  },
  setAccountRef: () => null,
  setAccountData: () => null,
  currentUser: null,
  setCurrentUser: () => null
});

export const useUserContext = () => useContext(UserContext);
