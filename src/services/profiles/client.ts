import 'client-only';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  or,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import type {
  CollectionReference,
  DocumentData,
  DocumentSnapshot,
  Query
} from 'firebase/firestore';
import { getFirebaseClient } from '../../lib/firebase/client';
import type { Unsubscribe } from '../accounts/types';
import type { ProfileData, ProfileDto, ProfilePatch } from './types';

const getProfilesCollection = (): CollectionReference<DocumentData> =>
  collection(getFirebaseClient().firestore, 'profiles');

const mapProfileSnapshot = <TData extends ProfileData>(
  snapshot: DocumentSnapshot<DocumentData>
): ProfileDto<TData> | null =>
  snapshot.exists()
    ? { data: snapshot.data() as TData, id: snapshot.id }
    : null;

const findProfile = async <TData extends ProfileData>(
  profilesQuery: Query<DocumentData>
): Promise<ProfileDto<TData> | null> => {
  const snapshot = await getDocs(profilesQuery);
  const profileSnapshot = snapshot.docs[0];

  return profileSnapshot
    ? { data: profileSnapshot.data() as TData, id: profileSnapshot.id }
    : null;
};

export const getProfileById = async <TData extends ProfileData = ProfileData>(
  profileId: string
): Promise<ProfileDto<TData> | null> => {
  const snapshot = await getDoc(doc(getProfilesCollection(), profileId));

  return mapProfileSnapshot<TData>(snapshot);
};

export const findProfileByUid = async <TData extends ProfileData = ProfileData>(
  uid: string
): Promise<ProfileDto<TData> | null> =>
  findProfile<TData>(
    query(getProfilesCollection(), where('uid', '==', uid), limit(1))
  );

export const findProfileByAccountId = async <
  TData extends ProfileData = ProfileData
>(
  accountId: string
): Promise<ProfileDto<TData> | null> =>
  findProfile<TData>(
    query(
      getProfilesCollection(),
      where('account_id', '==', accountId),
      limit(1)
    )
  );

export const findProfileByUidOrAccountId = async <
  TData extends ProfileData = ProfileData
>(
  value: string
): Promise<ProfileDto<TData> | null> =>
  findProfile<TData>(
    query(
      getProfilesCollection(),
      or(where('uid', '==', value), where('account_id', '==', value)),
      limit(1)
    )
  );

export const createProfile = async <TData extends ProfileData>(
  data: TData
): Promise<ProfileDto<TData>> => {
  const profileReference = await addDoc(getProfilesCollection(), data);

  return { data, id: profileReference.id };
};

export const updateProfile = async (
  profileId: string,
  patch: ProfilePatch
): Promise<void> => {
  await updateDoc(doc(getProfilesCollection(), profileId), patch);
};

export const subscribeToProfile = <TData extends ProfileData = ProfileData>(
  profileId: string,
  onChange: (profile: ProfileDto<TData> | null) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const profileReference = doc(getProfilesCollection(), profileId);
  const handleSnapshot = (snapshot: DocumentSnapshot<DocumentData>) =>
    onChange(mapProfileSnapshot<TData>(snapshot));

  return onError
    ? onSnapshot(profileReference, handleSnapshot, onError)
    : onSnapshot(profileReference, handleSnapshot);
};
