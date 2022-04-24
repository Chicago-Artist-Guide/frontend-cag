import { createContext, useContext } from 'react';

export type FirebaseContextType = {
  firebaseApp: any;
  firebaseAnalytics: any;
  firebaseAuth: any;
  firebaseFirestore: any;
  firebaseStorage: any;
};

export const FirebaseContext = createContext<FirebaseContextType>({
  firebaseApp: null,
  firebaseAnalytics: null,
  firebaseAuth: null,
  firebaseFirestore: null,
  firebaseStorage: null
});

export const useFirebaseContext = () => useContext(FirebaseContext);
