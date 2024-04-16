import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { IndividualProfileDataFullInit } from '../components/SignUp/Individual/types';
import { MatchingFilters } from '../components/Matches/types';

// TODO: add version for roles called fetchRolesWithFilters()

export async function fetchTalentWithFilters(
  firebaseStore: Firestore,
  filters: MatchingFilters
): Promise<IndividualProfileDataFullInit[]> {
  const { type: accountType, ...profileFilters } = filters;
  const accountsRef = collection(firebaseStore, 'accounts');
  const accountsQuery = query(accountsRef, where('type', '==', accountType));
  const accountsSnapshot = await getDocs(accountsQuery);

  // collect all individual uuids
  const uuids = accountsSnapshot.docs.map((doc) => doc.id);

  // get matching profiles
  const profilesRef = collection(firebaseStore, 'profiles');
  let profileQuery = query(profilesRef, where('uuid', 'in', uuids));

  for (const [field, value] of Object.entries(profileFilters)) {
    if (value !== undefined) {
      // Check if the value is an array for filters like ethnicity and age range
      if (Array.isArray(value) && value.length > 0) {
        profileQuery = query(
          profileQuery,
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
