import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  QueryDocumentSnapshot
} from 'firebase/firestore';

export async function fetchTalentWithFilters(
  firebaseStore: Firestore,
  filters = {}
) {
  const matchesRef = collection(firebaseStore, 'profiles');

  // Start building the query
  let q = query(matchesRef);

  for (const [field, value] of Object.entries(filters)) {
    if (value) {
      // Update the query with additional where clauses for each filter
      q = query(q, where(field, '==', value));
    }
  }

  const snapshot = await getDocs(q);
  const matches = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
    id: doc.id,
    ...doc.data()
  }));

  return matches;
}
