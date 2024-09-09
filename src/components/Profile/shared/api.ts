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

export const getNameForAccount = async (
  firebaseStore: Firestore,
  accountId: string
) => {
  const docRef = doc(firebaseStore, 'accounts', accountId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data() as IndividualAccountInit;
    const { first_name, last_name } = data;

    return first_name && last_name
      ? `${data.first_name} ${data.last_name}`
      : `User ${accountId}`;
  } else {
    return 'Profile N/A';
  }
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
