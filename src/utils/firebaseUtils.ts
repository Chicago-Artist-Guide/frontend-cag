import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  QueryDocumentSnapshot,
  orderBy,
  doc,
  getDoc,
  DocumentData
} from 'firebase/firestore';
import { IndividualProfileDataFullInit } from '../components/SignUp/Individual/types';
import { MatchingFilters } from '../components/Matches/types';
import { MessageFilters, MessageType } from '../components/Messages/types';
import { Production } from '../components/Profile/Company/types';
import { IndividualAccountInit } from '../components/SignUp/Individual/types';

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

// TODO: add version for roles called fetchRolesWithFilters()
export async function fetchTalentWithFilters(
  firebaseStore: Firestore,
  filters: MatchingFilters
): Promise<IndividualProfileDataFullInit[]> {
  const { type: accountType, ...profileFilters } = filters;

  const profilesRef = collection(firebaseStore, 'profiles');
  const profileQueries: any[] = [];

  console.log('filters', filters);

  for (const [field, value] of Object.entries(profileFilters)) {
    if (value !== undefined) {
      // Check if the value is an array for filters like ethnicity and age range
      if (Array.isArray(value) && value.length > 0) {
        const profileQuery = query(
          profilesRef,
          where(field, 'array-contains-any', value)
        );
        profileQueries.push(profileQuery);
      } else {
        const profileQuery = query(profilesRef, where(field, '==', value));
        profileQueries.push(profileQuery);
      }
    }
  }

  console.log('profileQueries', profileQueries);

  const snapshotPromises = profileQueries.map((profileQuery) =>
    getDocs(profileQuery)
  );
  const snapshots = await Promise.all(snapshotPromises);

  console.log('snapshots', snapshots);

  const matches: IndividualProfileDataFullInit[] = [];

  for (const snapshot of snapshots) {
    const profiles = snapshot.docs.map((doc: QueryDocumentSnapshot<any>) => ({
      id: doc.id,
      ...(doc.data() as IndividualProfileDataFullInit)
    }));

    matches.push(...profiles);
  }

  console.log('matches', matches);

  return matches;
}

export const getMatchName = async (
  firebaseStore: Firestore,
  account_id: string
) => {
  const docRef = doc(firebaseStore, 'accounts', account_id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data() as IndividualAccountInit;
    const { first_name, last_name } = data;
    return first_name && last_name
      ? `${data.first_name} ${data.last_name}`
      : `User ${account_id}`;
  } else {
    return '';
  }
};

export const fetchMessagesByAccountAndRole = async (
  firebaseStore: Firestore,
  filters: MessageFilters
) => {
  const messagesCollection = collection(firebaseStore, 'messages');
  let q;

  if (filters.roleId && filters.accountId) {
    q = query(
      messagesCollection,
      where('role_id', '==', filters.roleId),
      where('from_id', '==', filters.accountId),
      orderBy('timestamp', 'desc')
    );
  } else if (filters.accountId) {
    q = query(
      messagesCollection,
      where('from_id', '==', filters.accountId),
      orderBy('timestamp', 'desc')
    );
  } else {
    throw new Error('Invalid filter combination');
  }

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as MessageType)
  );
};

export const fetchSingleThread = async (
  firebaseStore: Firestore,
  roleId: string,
  fromId: string,
  toId: string
) => {
  const messagesCollection = collection(firebaseStore, 'messages');
  const q = query(
    messagesCollection,
    where('role_id', '==', roleId),
    where('from_id', '==', fromId),
    where('to_id', '==', toId),
    orderBy('timestamp', 'desc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as MessageType)
  );
};
