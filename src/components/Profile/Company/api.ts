import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
  limit,
  updateDoc
} from 'firebase/firestore';
import { Profile, Production, Role, TheaterAccount } from './types';
import { RoleStatus } from '../shared/profile.types';

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

export const getTheaterAccountByAccountId = async (
  firebaseStore: Firestore,
  accountId: string
) => {
  const docRef = doc(firebaseStore, 'accounts', accountId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as TheaterAccount;
  } else {
    return false;
  }
};

export const getTheaterAccountByUid = async (
  firebaseStore: Firestore,
  uid: string
) => {
  const accountQuery = query(
    collection(firebaseStore, 'accounts'),
    where('uid', '==', uid),
    limit(1)
  );
  const queryAccountSnapshot = await getDocs(accountQuery);

  if (queryAccountSnapshot.empty) {
    console.error('No company account found!', uid);
    return false;
  }
  const snapAccount = queryAccountSnapshot.docs[0];
  return { id: snapAccount.id, ...snapAccount.data() } as TheaterAccount;
};

export const getTheaterByAccountId = async (
  firebaseStore: Firestore,
  accountId: string
) => {
  const profileQuery = query(
    collection(firebaseStore, 'profiles'),
    where('account_id', '==', accountId),
    limit(1)
  );
  const queryProfileSnapshot = await getDocs(profileQuery);

  if (queryProfileSnapshot.empty) {
    console.error('No company profile found!', accountId);
    return false;
  }

  return queryProfileSnapshot.docs[0].data() as Profile;
};

export const updateRoleStatus = async (
  firebaseStore: Firestore,
  productionId: string,
  roleId: string,
  roleStatus: RoleStatus,
  roles: Role[]
): Promise<Role[]> => {
  const updatedRoles = roles.map((role) =>
    role.role_id === roleId ? { ...role, role_status: roleStatus } : role
  );
  const docRef = doc(firebaseStore, 'productions', productionId);
  await updateDoc(docRef, { roles: updatedRoles });
  return updatedRoles;
};

// Convenience wrapper: account uid → company profile. Kept exported because
// staging consumers (e.g. CompanyMatchCard prior to DEV-488's three-site
// rewrite) still import it. The newer call sites prefer the explicit
// getTheaterAccountByUid + getTheaterByAccountId pair so the
// account.theater_name fallback can be applied when the profile is missing
// theatre_name. Don't delete without grepping `getTheaterByAccountUid`
// across master AND staging.
export const getTheaterByAccountUid = async (
  firebaseStore: Firestore,
  uid: string
) => {
  const theaterAccount = await getTheaterAccountByUid(firebaseStore, uid);

  if (!theaterAccount) {
    console.error('Could not find company account while getting profile');
    return false;
  }

  return await getTheaterByAccountId(firebaseStore, theaterAccount.id);
};
