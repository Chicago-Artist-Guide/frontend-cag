import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  collection,
  where,
  query,
  limit
} from 'firebase/firestore';
import { IndividualAccountInit } from '../../SignUp/Individual/types';

export const getAccountWithAccountId = async (
  firebaseStore: Firestore,
  accountId: string
) => {
  const docRef = doc(firebaseStore, 'accounts', accountId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data() as IndividualAccountInit;
    return data;
  }

  // try to find account if accountId is uid?
  const accountQuery = query(
    collection(firebaseStore, 'accounts'),
    where('uid', '==', accountId),
    limit(1)
  );
  const queryAccountSnapshot = await getDocs(accountQuery);

  if (!queryAccountSnapshot.empty) {
    return queryAccountSnapshot.docs[0].data();
  }

  return false;
};

export const getProfileWithUid = async (
  firebaseStore: Firestore,
  accountId: string
) => {
  const profileQuery = query(
    collection(firebaseStore, 'profiles'),
    where('uid', '==', accountId),
    limit(1)
  );
  const queryProfileSnapshot = await getDocs(profileQuery);

  if (queryProfileSnapshot.empty) {
    console.error('No profile found!');
    return false;
  }

  return queryProfileSnapshot.docs[0].data();
};

export const getNameForAccount = async (
  firebaseStore: Firestore,
  accountId: string
) => {
  const findAccount = await getAccountWithAccountId(firebaseStore, accountId);

  if (findAccount) {
    const { first_name, last_name } = findAccount;

    return first_name && last_name
      ? `${first_name} ${last_name}`
      : `User ${accountId}`;
  }

  return 'Profile N/A';
};

export const getTheaterNameForAccount = async (
  firebaseStore: Firestore,
  accountId: string
) => {
  const docRef = query(
    collection(firebaseStore, 'accounts'),
    where('uid', '==', accountId),
    limit(1)
  );
  const docSnap = await getDocs(docRef);

  if (!docSnap.empty) {
    const data = docSnap.docs[0].data();
    const { theater_name } = data;

    return theater_name ? theater_name : `Theater ${accountId}`;
  } else {
    return 'Theatre N/A';
  }
};
