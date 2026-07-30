import { collection, getDocs } from 'firebase/firestore';
import type { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { getServerFirestore } from '../../lib/firebase/server';
import type { CommunityEvent } from './types';

// Server-side reads of the public `events` collection.
//
// No `where`/`orderBy` at all — the existing client (src/routes/Events.tsx)
// fetches every document with a plain `query(eventsRef)` and filters/sorts
// in memory, so there was never a composite index for this collection in
// the first place. Kept that way here deliberately: see
// src/services/productions/server.ts for why this project avoids
// introducing new composite index requirements (manual, no-CI deploys, and
// a missing index fails a Server Component's fetch outright).
//
// Published/draft/cancelled filtering and upcoming/past sorting both live
// in eventFilters.ts, not here — `listEvents` returns every event document
// as-is so that logic stays isolated and testable without mocking Firestore.
const normalizeEvent = (
  snapshot: DocumentSnapshot<DocumentData>
): CommunityEvent => {
  const data = snapshot.data() ?? {};

  return {
    ...(data as CommunityEvent),
    id: snapshot.id
  };
};

export const listEvents = async (): Promise<CommunityEvent[]> => {
  const snapshot = await getDocs(collection(getServerFirestore(), 'events'));

  return snapshot.docs.map(normalizeEvent);
};
