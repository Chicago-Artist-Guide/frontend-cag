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
  addDoc,
  Query,
  QuerySnapshot
} from 'firebase/firestore';
import { IndividualProfileDataFullInit } from '../components/SignUp/Individual/types';
import {
  FILTER_ARRAYS_TO_SINGLE_VALUES_MATCHING,
  MatchingFilters
} from '../components/Matches/types';
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

export const getMatchName = async (
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

export const getTheaterTalentMatch = async (
  firebaseStore: Firestore,
  productionId: string,
  roleId: string,
  talentAccountId: string
) => {
  const productionRef = doc(firebaseStore, 'productions', productionId);
  const talentAccountRef = doc(firebaseStore, 'accounts', talentAccountId);

  if (!productionRef || !talentAccountRef) {
    throw new Error('Invalid production or talent account');
  }

  const matchesQuery = query(
    collection(firebaseStore, 'theater_talent_matches'),
    where('production_id', '==', productionRef),
    where('role_id', '==', roleId),
    where('talent_account_id', '==', talentAccountRef)
  );

  const querySnapshot = await getDocs(matchesQuery);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }

  return false;
};

export const createTheaterTalentMatch = async (
  firebaseStore: Firestore,
  productionId: string,
  roleId: string,
  talentAccountId: string,
  status: boolean
) => {
  const productionRef = doc(firebaseStore, 'productions', productionId);
  const talentAccountRef = doc(firebaseStore, 'accounts', talentAccountId);

  if (!productionRef || !talentAccountRef) {
    throw new Error('Invalid production or talent account');
  }

  const theaterTalentMatchAlreadyExists = await getTheaterTalentMatch(
    firebaseStore,
    productionId,
    roleId,
    talentAccountId
  );

  if (theaterTalentMatchAlreadyExists) {
    throw new Error('Match already exists');
  }

  const data = {
    production_id: productionRef,
    role_id: roleId,
    status: status,
    talent_account_id: talentAccountRef
  };

  return addDoc(collection(firebaseStore, 'theater_talent_matches'), data);
};

// TODO: add version for roles called fetchRolesWithFilters()
export async function fetchTalentWithFilters(
  firebaseStore: Firestore,
  filters: MatchingFilters,
  productionId: string,
  roleId: string
): Promise<IndividualProfileDataFullInit[]> {
  const { type: accountType, matchStatus, ...profileFilters } = filters;
  const profilesRef = collection(firebaseStore, 'profiles');
  const snapshotPromises: Promise<QuerySnapshot<any>>[] = [];
  let singleProfileQuery = query(profilesRef);

  for (const [field, value] of Object.entries(profileFilters)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          let profileQuery: Query;

          // if the comparison is array to single value
          if (FILTER_ARRAYS_TO_SINGLE_VALUES_MATCHING.includes(field)) {
            profileQuery = query(profilesRef, where(field, 'in', value));
          } else {
            // we know the comparison is array to array
            profileQuery = query(
              profilesRef,
              where(field, 'array-contains-any', value)
            );
          }

          snapshotPromises.push(getDocs(profileQuery));
        }
      } else {
        singleProfileQuery = query(
          singleProfileQuery,
          where(field, '==', value)
        );
      }
    }
  }

  snapshotPromises.unshift(getDocs(singleProfileQuery));

  const snapshots = await Promise.all(snapshotPromises);

  const matchesSet: Set<string> = new Set(
    snapshots[0].docs.map((doc: QueryDocumentSnapshot<any>) => doc.id)
  );
  const matches: IndividualProfileDataFullInit[] = [];

  // This is the complicated part: we have to find the intersection
  // Because we did multuple queries and only want profiles that match ALL of the filters
  for (let i = 0; i < snapshots.length; i++) {
    const currentSet = new Set(
      snapshots[i].docs.map((doc: QueryDocumentSnapshot<any>) => doc.id)
    );

    for (const id of matchesSet) {
      if (!currentSet.has(id)) {
        matchesSet.delete(id);
      }
    }
  }

  // finally, collect remaining matches
  for (const id of matchesSet) {
    const docRef = doc(profilesRef, id);
    const docSnap = await getDoc(docRef);

    // filter if we need to care about an existing match status
    if (docSnap.exists()) {
      const profileData = docSnap.data() as IndividualProfileDataFullInit;

      if (matchStatus !== null && matchStatus !== undefined) {
        const findMatch = await getTheaterTalentMatch(
          firebaseStore,
          productionId,
          roleId,
          profileData.account_id
        );
        const foundMatchStatus = findMatch ? findMatch.status : null;

        if (foundMatchStatus === matchStatus) {
          matches.push({ ...profileData });
        }
      } else {
        matches.push({ ...profileData });
      }
    }
  }

  return matches;
}

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
