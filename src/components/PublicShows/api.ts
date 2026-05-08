import {
  collection,
  Firestore,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { Production, Role } from '../Profile/Company/types';
import { ACTIVE_PRODUCTION_STATUSES } from '../../utils/lookups';

// A role flattened with its parent production context, suitable for
// rendering in a list outside the show-detail page. theatre_name is
// intentionally absent for the unauth /roles surface — the accounts
// collection requires auth (it carries email), and we don't yet have a
// public-safe theatre directory. Follow-up: a `company_public_profiles`
// collection or denormalize theater_name onto the production document.
export type PublicRoleListItem = Role & {
  production_id: string;
  production_name: string;
  production_image_url?: string;
  audition_start?: string;
  audition_end?: string;
  account_id: string;
};

// Fetch all open roles across all active productions, flattened into a
// single list. The list is shaped for the unauthenticated /roles page —
// each item carries enough context (production name, dates) to render a
// self-contained role card. Reads only the productions collection; no
// account/profile lookups happen on this path so unauth visitors don't
// trigger rule denials and we don't leak email addresses (which live on
// company account docs).
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

    for (const role of openRoles) {
      items.push({
        ...role,
        production_id: production.production_id,
        production_name: production.production_name,
        production_image_url: production.production_image_url,
        audition_start: production.audition_start,
        audition_end: production.audition_end,
        account_id: production.account_id
      });
    }
  }

  return items;
};
