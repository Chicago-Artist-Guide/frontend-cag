import { collection, getDocs } from 'firebase/firestore';
import type { DocumentData, DocumentSnapshot } from 'firebase/firestore';
import { getServerFirestore } from '../../lib/firebase/server';
import type { RoleOpportunity } from './types';

// Server-side reads of the public `roleOpportunities` collection (the
// /get-involved page). No `where`/`orderBy` — the existing client
// (src/routes/GetInvolved.tsx) fetches every document with a plain
// `query(roleOpportunitiesRef)` and splits/limits in memory, so there is no
// composite index to keep in sync. See src/services/productions/server.ts
// for why this project avoids introducing new composite index
// requirements.
//
// Source documents mix camelCase and snake_case field names — the client's
// own fallback chain (`data.roleName || data.role_name`) is preserved here
// so both shapes normalize to the same fields.
const normalizeRoleOpportunity = (
  snapshot: DocumentSnapshot<DocumentData>
): RoleOpportunity => {
  const data = snapshot.data() ?? {};

  return {
    description: data.description || '',
    googleFormUrl: data.googleFormUrl || data.google_form_url || undefined,
    id: snapshot.id,
    location: data.location || 'Chicago',
    moreInfoUrl: data.moreInfoUrl || data.more_info_url || undefined,
    ongoing: Boolean(data.ongoing),
    pay: data.pay || undefined,
    productionId: data.productionId || data.production_id || '',
    productionName: data.productionName || data.production_name || '',
    roleName: data.roleName || data.role_name || '',
    roleType: data.roleType || data.role_type || undefined
  };
};

export const listRoleOpportunities = async (): Promise<RoleOpportunity[]> => {
  const snapshot = await getDocs(
    collection(getServerFirestore(), 'roleOpportunities')
  );

  return snapshot.docs.map(normalizeRoleOpportunity);
};

export interface RoleOpportunitiesByType {
  ongoing: RoleOpportunity[];
  temporal: RoleOpportunity[];
}

// The client caps the temporal (non-ongoing) list at 6 for display but shows
// every ongoing role — see src/routes/GetInvolved.tsx.
const MAX_TEMPORAL_ROLES = 6;

export const splitRoleOpportunities = (
  roles: RoleOpportunity[]
): RoleOpportunitiesByType => ({
  ongoing: roles.filter((role) => role.ongoing),
  temporal: roles.filter((role) => !role.ongoing).slice(0, MAX_TEMPORAL_ROLES)
});
