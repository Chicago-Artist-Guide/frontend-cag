import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  collection,
  where,
  query,
  limit,
  or
} from 'firebase/firestore';
import { IndividualAccountInit } from '../../SignUp/Individual/types';

export const getAccountWithAccountId = async (
  firebaseStore: Firestore,
  accountId: string
) => {
  if (!accountId) {
    return false;
  }

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
  if (!accountId) {
    return false;
  }

  const profileQuery = query(
    collection(firebaseStore, 'profiles'),
    or(where('uid', '==', accountId), where('account_id', '==', accountId)),
    limit(1)
  );
  const queryProfileSnapshot = await getDocs(profileQuery);

  if (queryProfileSnapshot.empty) {
    return false;
  }

  const profileData = queryProfileSnapshot.docs[0].data();
  return profileData;
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
  // Thread refs store the accounts document ID, not the auth uid. Look up
  // the account by doc id first (with uid fallback), then prefer the
  // profile's theatre_name over account.theater_name — same fallback the
  // rest of the app uses for companies that haven't finished a profile.
  const findAccount = await getAccountWithAccountId(firebaseStore, accountId);
  const findProfile = await getProfileWithUid(firebaseStore, accountId);

  const profileName =
    (findProfile && (findProfile.theatre_name || findProfile.theater_name)) ||
    '';
  const accountName =
    (findAccount &&
      ((findAccount as { theater_name?: string; theatre_name?: string })
        .theater_name ||
        (findAccount as { theatre_name?: string }).theatre_name)) ||
    '';

  if (profileName) {
    return profileName;
  }

  if (accountName) {
    return accountName;
  }

  return 'Theatre N/A';
};
