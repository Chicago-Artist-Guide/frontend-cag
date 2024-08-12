import { Firestore, doc, getDoc } from 'firebase/firestore';
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
    return '';
  }
};
