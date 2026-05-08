import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { Production, Role } from '../Profile/Company/types';

// A role flattened with its parent production context, suitable for
// rendering in a list outside the show-detail page.
export type PublicRoleListItem = Role & {
  production_id: string;
  production_name: string;
  production_image_url?: string;
  audition_start?: string;
  audition_end?: string;
  account_id: string;
  theatre_name?: string;
};

// Productions are considered "active" (i.e. publicly browsable) when they
// match one of these statuses. Mirrors the gating used in PublicShows.tsx
// and Matches/api.ts so the public role list stays consistent with the
// rest of the marketing surface.
export const ACTIVE_PRODUCTION_STATUSES = [
  'Casting',
  'Hiring',
  'Pre-Production'
];

// Theatre name resolution requires reading the company's profile via the
// account record. We cache lookups per call to avoid N duplicate reads
// when many productions share a theatre.
const resolveTheatreName = async (
  firebaseStore: Firestore,
  accountId: string,
  cache: Map<string, string>
): Promise<string | undefined> => {
  if (!accountId) {
    return undefined;
  }

  if (cache.has(accountId)) {
    return cache.get(accountId);
  }

  try {
    const accountRef = doc(firebaseStore, 'accounts', accountId);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      cache.set(accountId, '');
      return undefined;
    }

    const accountData = accountSnap.data();
    const profileId = accountData?.profile_id;

    if (!profileId) {
      cache.set(accountId, '');
      return undefined;
    }

    const profileRef = doc(firebaseStore, 'profiles', profileId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      cache.set(accountId, '');
      return undefined;
    }

    const theatreName =
      (profileSnap.data()?.theatre_name as string | undefined) || '';
    cache.set(accountId, theatreName);
    return theatreName || undefined;
  } catch (err) {
    console.error('Error resolving theatre name', err);
    cache.set(accountId, '');
    return undefined;
  }
};

// Fetch all open roles across all active productions, flattened into a
// single list. The list is shaped for the unauthenticated /roles page —
// each item carries enough context (production name, theatre, dates) to
// render a self-contained role card without further reads.
export const fetchPublicOpenRoles = async (
  firebaseStore: Firestore
): Promise<PublicRoleListItem[]> => {
  const productionsRef = query(
    collection(firebaseStore, 'productions'),
    where('status', 'in', ACTIVE_PRODUCTION_STATUSES)
  );

  const productionsSnap = await getDocs(productionsRef);
  const productions = productionsSnap.docs
    .map((d) => {
      const data = d.data() as Production;
      return {
        ...data,
        production_id: data.production_id || d.id
      };
    })
    .filter(
      (p) =>
        typeof p.production_name === 'string' &&
        p.production_name.length > 0 &&
        typeof p.account_id === 'string' &&
        p.account_id.length > 0
    );

  const theatreNameCache = new Map<string, string>();
  const items: PublicRoleListItem[] = [];

  for (const production of productions) {
    const roles = Array.isArray(production.roles) ? production.roles : [];

    // Only show roles that are explicitly Open. Roles missing role_status
    // are treated as open by convention (matches PublicShowDetail behaviour
    // where the role still appears for unauth viewers).
    const openRoles = roles.filter(
      (r) => r && (r.role_status === undefined || r.role_status === 'Open')
    );

    if (openRoles.length === 0) {
      continue;
    }

    const theatreName = await resolveTheatreName(
      firebaseStore,
      production.account_id,
      theatreNameCache
    );

    for (const role of openRoles) {
      items.push({
        ...role,
        production_id: production.production_id,
        production_name: production.production_name,
        production_image_url: production.production_image_url,
        audition_start: production.audition_start,
        audition_end: production.audition_end,
        account_id: production.account_id,
        theatre_name: theatreName
      });
    }
  }

  return items;
};
