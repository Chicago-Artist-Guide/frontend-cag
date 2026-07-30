import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import type { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import type { Production, Role } from '../../components/Profile/Company/types';
import { getServerFirestore } from '../../lib/firebase/server';
import { ACTIVE_PRODUCTION_STATUSES } from '../../utils/lookups';
import type { PublicRoleListItem } from './types';

// Server-side reads of the public `productions` collection.
//
// Deliberately NOT sorted with a Firestore `orderBy`: `where('status','in',…)`
// combined with an `orderBy` needs a composite index, and index deploys in this
// project are manual with no CI behind them. A missing index fails the query
// outright — which on a Server Component means a request-time 500 instead of an
// empty client-side list. Sorting in memory keeps these pages resilient to
// index drift. The active production set is small enough (tens, not thousands)
// that this is not a meaningful cost.
const normalizeProduction = (
  snapshot: DocumentSnapshot<DocumentData>
): Production | null => {
  const data = snapshot.data();

  if (!data) {
    return null;
  }

  return {
    ...(data as Production),
    production_id: data.production_id || snapshot.id
  };
};

const isPubliclyVisible = (production: Production): boolean =>
  typeof production.production_name === 'string' &&
  production.production_name.length > 0 &&
  typeof production.account_id === 'string' &&
  production.account_id.length > 0 &&
  !production.admin_hidden;

const byProductionName = (first: Production, second: Production): number =>
  first.production_name.localeCompare(second.production_name);

// A role is shown when it is explicitly Open, or when `role_status` is absent —
// legacy documents predate the field and are open by convention. Matches the
// existing client behaviour in PublicShowDetail and PublicRoles.
const isOpenRole = (role: Role): boolean =>
  Boolean(role) &&
  typeof role === 'object' &&
  !Array.isArray(role) &&
  (role.role_status === undefined || role.role_status === 'Open');

export const listActiveProductions = async (): Promise<Production[]> => {
  const snapshot = await getDocs(
    query(
      collection(getServerFirestore(), 'productions'),
      where('status', 'in', ACTIVE_PRODUCTION_STATUSES)
    )
  );

  return snapshot.docs
    .map(normalizeProduction)
    .filter((production): production is Production => production !== null)
    .filter(isPubliclyVisible)
    .sort(byProductionName);
};

export const getProductionById = async (
  productionId: string
): Promise<Production | null> => {
  const snapshot = await getDoc(
    doc(collection(getServerFirestore(), 'productions'), productionId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  const production = normalizeProduction(snapshot);

  return production && isPubliclyVisible(production) ? production : null;
};

// Every open role across every active production, flattened for the /roles
// page. `theatre_name` is intentionally absent: the `accounts` collection
// requires auth (it carries email addresses), so an unauthenticated surface —
// server-rendered or not — must not join against it.
export const listPublicOpenRoles = async (): Promise<PublicRoleListItem[]> => {
  const productions = await listActiveProductions();

  return productions.flatMap((production) =>
    (Array.isArray(production.roles) ? production.roles : [])
      .filter(isOpenRole)
      .map((role) => ({
        ...role,
        account_id: production.account_id,
        audition_end: production.audition_end,
        audition_start: production.audition_start,
        production_id: production.production_id,
        production_image_url: production.production_image_url,
        production_name: production.production_name
      }))
  );
};
