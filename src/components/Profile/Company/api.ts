import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
  limit
} from 'firebase/firestore';
import { Profile, Production, TheaterAccount } from './types';

export const getProduction = async (
  firebaseStore: Firestore,
  productionId: string
) => {
  const docRef = doc(firebaseStore, 'productions', productionId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data() as Production;
    return data;
  } else {
    return false;
  }
};

export const getTheaterAccountByAccountId = async (
  firebaseStore: Firestore,
  accountId: string
) => {
  const docRef = doc(firebaseStore, 'accounts', accountId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as TheaterAccount;
  } else {
    return false;
  }
};

export const getTheaterAccountByUid = async (
  firebaseStore: Firestore,
  uid: string
) => {
  const accountQuery = query(
    collection(firebaseStore, 'accounts'),
    where('uid', '==', uid),
    limit(1)
  );
  const queryAccountSnapshot = await getDocs(accountQuery);

  if (queryAccountSnapshot.empty) {
    console.error('No company account found!', uid);
    return false;
  }
  const snapAccount = queryAccountSnapshot.docs[0];
  return { id: snapAccount.id, ...snapAccount.data() } as TheaterAccount;
};

export const getTheaterByAccountId = async (
  firebaseStore: Firestore,
  accountId: string
) => {
  const profileQuery = query(
    collection(firebaseStore, 'profiles'),
    where('account_id', '==', accountId),
    limit(1)
  );
  const queryProfileSnapshot = await getDocs(profileQuery);

  if (queryProfileSnapshot.empty) {
    console.error('No company profile found!', accountId);
    return false;
  }

  return queryProfileSnapshot.docs[0].data() as Profile;
};

export const getTheaterByAccountUid = async (
  firebaseStore: Firestore,
  uid: string
) => {
  const theaterAccount = await getTheaterAccountByUid(firebaseStore, uid);

  if (!theaterAccount) {
    console.error('Could not find company account while getting profile');
    return false;
  }

  return await getTheaterByAccountId(firebaseStore, theaterAccount.id);
};
