/**
 * Admin Companies API — production-level admin actions.
 */

import {
  collection,
  doc,
  Firestore,
  getDocs,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { Production } from '../../Profile/Company/types';

/**
 * All productions owned by a company account, newest first isn't tracked
 * (productions don't carry a reliable created_at), so this returns them in
 * whatever order Firestore hands back — callers that need a stable order
 * should sort by production_name.
 */
export const getProductionsForAccount = async (
  firebaseStore: Firestore,
  accountId: string
): Promise<Production[]> => {
  if (!accountId) {
    return [];
  }

  const productionsRef = collection(firebaseStore, 'productions');
  const productionsQuery = query(
    productionsRef,
    where('account_id', '==', accountId)
  );
  const snapshot = await getDocs(productionsQuery);

  return snapshot.docs.map((productionDoc) => {
    const data = productionDoc.data() as Production;
    // Always use the real Firestore document ID, never the production_id
    // *field*. Found live in dev: 32 of 59 productions under one account
    // have a production_id field that's stale/wrong (some empty, some
    // duplicated across many unrelated docs, none pointing to any real
    // document) -- using it as a write target silently hit updateDoc() on
    // a nonexistent document, which Firestore's rules evaluate against a
    // null resource and report back as "Missing or insufficient
    // permissions" rather than "not found".
    return {
      ...data,
      production_id: productionDoc.id
    };
  });
};

/**
 * Admin-only visibility toggle. Firestore rules restrict this update to
 * exactly the admin_hidden field (see firestore.rules) — it cannot be used
 * to edit any other part of a production the admin doesn't own.
 */
export const setProductionAdminHidden = async (
  firebaseStore: Firestore,
  productionId: string,
  hidden: boolean
): Promise<void> => {
  const productionRef = doc(firebaseStore, 'productions', productionId);
  await updateDoc(productionRef, { admin_hidden: hidden });
};
