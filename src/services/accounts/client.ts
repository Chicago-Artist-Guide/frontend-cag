import 'client-only';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import type {
  CollectionReference,
  DocumentData,
  DocumentSnapshot
} from 'firebase/firestore';
import { getFirebaseClient } from '../../lib/firebase/client';
import { findProfileByUidOrAccountId } from '../profiles/client';
import type {
  AccountData,
  AccountDto,
  AccountPatch,
  Unsubscribe
} from './types';

const getAccountsCollection = (): CollectionReference<DocumentData> =>
  collection(getFirebaseClient().firestore, 'accounts');

const mapAccountSnapshot = <TData extends AccountData>(
  snapshot: DocumentSnapshot<DocumentData>
): AccountDto<TData> | null =>
  snapshot.exists()
    ? { data: snapshot.data() as TData, id: snapshot.id }
    : null;

const getAccountByIdFromCollection = async <TData extends AccountData>(
  accounts: CollectionReference<DocumentData>,
  accountId: string
): Promise<AccountDto<TData> | null> => {
  if (!accountId) {
    return null;
  }

  const snapshot = await getDoc(doc(accounts, accountId));

  return mapAccountSnapshot<TData>(snapshot);
};

const findAccountByUidFromCollection = async <TData extends AccountData>(
  accounts: CollectionReference<DocumentData>,
  uid: string
): Promise<AccountDto<TData> | null> => {
  const snapshot = await getDocs(
    query(accounts, where('uid', '==', uid), limit(1))
  );
  const accountSnapshot = snapshot.docs[0];

  return accountSnapshot
    ? { data: accountSnapshot.data() as TData, id: accountSnapshot.id }
    : null;
};

export const getAccountById = async <TData extends AccountData = AccountData>(
  accountId: string
): Promise<AccountDto<TData> | null> =>
  getAccountByIdFromCollection<TData>(getAccountsCollection(), accountId);

export const findAccountByUid = async <TData extends AccountData = AccountData>(
  uid: string
): Promise<AccountDto<TData> | null> =>
  findAccountByUidFromCollection<TData>(getAccountsCollection(), uid);

export const getAccountByIdOrUid = async <
  TData extends AccountData = AccountData
>(
  idOrUid: string
): Promise<AccountDto<TData> | null> => {
  const accounts = getAccountsCollection();
  const account = await getAccountByIdFromCollection<TData>(accounts, idOrUid);

  return account ?? findAccountByUidFromCollection<TData>(accounts, idOrUid);
};

export const createAccount = async <TData extends AccountData>(
  data: TData
): Promise<AccountDto<TData>> => {
  const accountReference = await addDoc(getAccountsCollection(), data);

  return { data, id: accountReference.id };
};

export const updateAccount = async (
  accountId: string,
  patch: AccountPatch
): Promise<void> => {
  await updateDoc(doc(getAccountsCollection(), accountId), patch);
};

export const subscribeToAccount = <TData extends AccountData = AccountData>(
  accountId: string,
  onChange: (account: AccountDto<TData> | null) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const accountReference = doc(getAccountsCollection(), accountId);
  const handleSnapshot = (snapshot: DocumentSnapshot<DocumentData>) =>
    onChange(mapAccountSnapshot<TData>(snapshot));

  return onError
    ? onSnapshot(accountReference, handleSnapshot, onError)
    : onSnapshot(accountReference, handleSnapshot);
};

export const getAccountDisplayName = async (
  accountIdOrUid: string
): Promise<string> => {
  const account = await getAccountByIdOrUid(accountIdOrUid);

  if (!account) {
    return 'Profile N/A';
  }

  const { first_name: firstName, last_name: lastName } = account.data;

  return firstName && lastName
    ? `${firstName} ${lastName}`
    : `User ${accountIdOrUid}`;
};

export const getTheaterDisplayNameByUid = async (
  idOrUid: string
): Promise<string> => {
  // Thread refs store the accounts document ID, not the auth uid. Look up
  // the account by doc id first (with uid fallback), and prefer the
  // profile's theatre_name over account.theater_name — same fallback the
  // rest of the app uses for companies that haven't finished a profile.
  const [account, profile] = await Promise.all([
    getAccountByIdOrUid(idOrUid),
    findProfileByUidOrAccountId(idOrUid)
  ]);

  const profileData = profile?.data as
    | { theatre_name?: string; theater_name?: string }
    | undefined;

  return (
    profileData?.theatre_name ||
    profileData?.theater_name ||
    account?.data.theater_name ||
    'Theatre N/A'
  );
};
