import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  QueryDocumentSnapshot,
  orderBy,
  doc,
  getDoc
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

  // This is inefficient to do, and Firebase limits IN queries to 10
  // We should get the same effect with profile filters
  /* const accountsRef = collection(firebaseStore, 'accounts');
  const accountsQuery = query(accountsRef, where('type', '==', accountType));
  const accountsSnapshot = await getDocs(accountsQuery);

  // collect all individual uuids
  const uuids = accountsSnapshot.docs.map((doc) => doc.id);

  // get matching profiles
  const profilesRef = collection(firebaseStore, 'profiles');
  let profileQuery = query(profilesRef, where('uuid', 'in', uuids));*/

  // get matching profiles
  const profilesRef = collection(firebaseStore, 'profiles');
  let profileQuery = query(profilesRef);

  for (const [field, value] of Object.entries(profileFilters)) {
    if (value !== undefined) {
      // Check if the value is an array for filters like ethnicity and age range
      if (Array.isArray(value) && value.length > 0) {
        profileQuery = query(
          profileQuery,
          // TODO: Firebase only supports ONE 'array-contains-any' per query
          // We have to refactor this to either:
          //  1. Only use 1 array query and then do the rest of the filtering client-side
          //  2. Do multiple queries, 1 per array filter, then merge them
          // One consideration is how this could impact pagination
          where(field, 'array-contains-any', value)
        );
      } else {
        // simple value check for everything else
        profileQuery = query(profileQuery, where(field, '==', value));
      }
    }
  }

  const snapshot = await getDocs(profileQuery);
  const matches = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
    id: doc.id,
    ...(doc.data() as IndividualProfileDataFullInit)
  }));

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
