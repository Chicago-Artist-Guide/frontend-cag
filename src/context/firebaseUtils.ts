import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { IndividualProfileDataFullInit } from '../components/SignUp/Individual/types';

export async function fetchTalentWithFilters(
  firebaseStore: Firestore,
  filters = {}
): Promise<IndividualProfileDataFullInit[]> {
  const matchesRef = collection(firebaseStore, 'profiles');

  let q = query(matchesRef);

  for (const [field, value] of Object.entries(filters)) {
    if (value !== undefined) {
      // Check if the value is an array for filters like ethnicity and age range
      if (Array.isArray(value) && value.length > 0) {
        q = query(q, where(field, 'array-contains-any', value));
      } else {
        // simple value check for everything else
        q = query(q, where(field, '==', value));
      }
    }
  }

  const snapshot = await getDocs(q);
  const matches = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
    id: doc.id,
    ...(doc.data() as IndividualProfileDataFullInit)
  }));

  return matches;
}
