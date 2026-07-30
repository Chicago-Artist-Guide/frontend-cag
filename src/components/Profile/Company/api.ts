import { Firestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Production, Role } from './types';
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
