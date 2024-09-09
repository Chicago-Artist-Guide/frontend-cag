import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  where,
  updateDoc,
  limit
} from 'firebase/firestore';
import { IndividualProfileDataFullInit } from '../SignUp/Individual/types';
import { Production, Role } from '../Profile/Company/types';
import {
  FILTER_ARRAYS_TO_SINGLE_VALUES_MATCHING,
  MatchingFilters,
  ProductionRole,
  TheaterOrTalent
} from './types';

export const getTheaterTalentMatch = async (
  firebaseStore: Firestore,
  productionId: string,
  roleId: string,
  talentAccountId: string,
  initiatedBy?: TheaterOrTalent
) => {
  const productionRef = doc(firebaseStore, 'productions', productionId);
  const talentAccountRef = doc(firebaseStore, 'accounts', talentAccountId);

  if (!productionRef || !talentAccountRef) {
    throw new Error('Invalid production or talent account');
  }

  const matchesRef = collection(firebaseStore, 'theater_talent_matches');
  let matchesQuery = query(
    matchesRef,
    where('production_id', '==', productionRef),
    where('role_id', '==', roleId),
    where('talent_account_id', '==', talentAccountRef)
  );

  if (initiatedBy) {
    matchesQuery = query(
      matchesQuery,
      where('initiated_by', '==', initiatedBy)
    );
  }

  const querySnapshot = await getDocs(matchesQuery);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }

  return false;
};

export const createTheaterTalentMatch = async (
  firebaseStore: Firestore,
  productionId: string,
  roleId: string,
  talentAccountId: string,
  status: boolean,
  theaterOrTalent: TheaterOrTalent
) => {
  const productionRef = doc(firebaseStore, 'productions', productionId);
  const talentAccountRef = doc(firebaseStore, 'accounts', talentAccountId);

  if (!productionRef || !talentAccountRef) {
    throw new Error('Invalid production or talent account');
  }

  const theaterTalentMatchAlreadyExists = await getTheaterTalentMatch(
    firebaseStore,
    productionId,
    roleId,
    talentAccountId
  );

  // if match exists, consider this a confirmation or rejection from the other party
  if (theaterTalentMatchAlreadyExists) {
    const matchRef = doc(
      firebaseStore,
      'theater_talent_matches',
      theaterTalentMatchAlreadyExists.id
    );
    const updateData = status
      ? { confirmed_by: theaterOrTalent }
      : { rejected_by: theaterOrTalent };

    await updateDoc(matchRef, updateData);
    return matchRef;
  }

  const data = {
    production_id: productionRef,
    role_id: roleId,
    status: status,
    talent_account_id: talentAccountRef,
    initiated_by: theaterOrTalent
  };

  return addDoc(collection(firebaseStore, 'theater_talent_matches'), data);
};

export async function fetchTalentWithFilters(
  firebaseStore: Firestore,
  filters: MatchingFilters,
  productionId: string,
  roleId: string
): Promise<IndividualProfileDataFullInit[]> {
  // NOTE: do not remove "accountType" from the destructuring below
  // it's necessary that it's removed for filters to work
  const { type: accountType, matchStatus, ...profileFilters } = filters;
  const profilesRef = collection(firebaseStore, 'profiles');
  const snapshotPromises: Promise<QuerySnapshot<any>>[] = [];
  let singleProfileQuery = query(profilesRef);

  for (const [field, value] of Object.entries(profileFilters)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          let profileQuery: Query;

          // if the comparison is array to single value
          if (FILTER_ARRAYS_TO_SINGLE_VALUES_MATCHING.includes(field)) {
            profileQuery = query(profilesRef, where(field, 'in', value));
          } else {
            // we know the comparison is array to array
            profileQuery = query(
              profilesRef,
              where(field, 'array-contains-any', value)
            );
          }

          snapshotPromises.push(getDocs(profileQuery));
        }
      } else {
        singleProfileQuery = query(
          singleProfileQuery,
          where(field, '==', value)
        );
      }
    }
  }

  snapshotPromises.unshift(getDocs(singleProfileQuery));

  const snapshots = await Promise.all(snapshotPromises);

  const matchesSet: Set<string> = new Set(
    snapshots[0].docs.map((doc: QueryDocumentSnapshot<any>) => doc.id)
  );
  const matches: IndividualProfileDataFullInit[] = [];

  // This is the complicated part: we have to find the intersection
  // Because we did multuple queries and only want profiles that match ALL of the filters
  for (let i = 0; i < snapshots.length; i++) {
    const currentSet = new Set(
      snapshots[i].docs.map((doc: QueryDocumentSnapshot<any>) => doc.id)
    );

    for (const id of matchesSet) {
      if (!currentSet.has(id)) {
        matchesSet.delete(id);
      }
    }
  }

  // finally, collect remaining matches
  for (const id of matchesSet) {
    const docRef = doc(profilesRef, id);
    const docSnap = await getDoc(docRef);

    // filter if we need to care about an existing match status
    if (docSnap.exists()) {
      const profileData = docSnap.data() as IndividualProfileDataFullInit;

      if (matchStatus !== null && matchStatus !== undefined) {
        const findMatch = await getTheaterTalentMatch(
          firebaseStore,
          productionId,
          roleId,
          profileData.account_id
        );
        const foundMatchStatus = findMatch ? findMatch.status : null;

        if (foundMatchStatus === matchStatus) {
          matches.push({ ...profileData });
        }
      } else {
        matches.push({ ...profileData });
      }
    }
  }

  return matches;
}

export async function fetchRolesForTalent(
  firebaseStore: Firestore,
  profile: IndividualProfileDataFullInit
): Promise<ProductionRole[]> {
  const roles: ProductionRole[] = [];
  const activeProductionStatuses = ['Casting', 'Hiring', 'Pre-Production'];
  const productionsRef = query(
    collection(firebaseStore, 'productions'),
    where('status', 'in', activeProductionStatuses)
  );

  try {
    const productionsSnapshot = await getDocs(productionsRef);
    const prods = productionsSnapshot.docs.map((p) => p.data() as Production);

    for (let p = 0; p < prods.length; p++) {
      const currProd = prods[p];

      if (currProd.roles) {
        const currProdRoles: Role[] = currProd.roles.filter((pR) => {
          if (!pR) {
            return false;
          }

          // stage role type
          // TODO: do more granular search for off-stage role categories
          if (profile.stage_role !== 'both-stage') {
            if (profile.stage_role.toUpperCase() !== pR.type?.toUpperCase()) {
              return false;
            }
          }

          // ethnicites
          if (
            profile.ethnicities &&
            pR.ethnicity &&
            !pR.ethnicity?.includes('Open to all ethnicities')
          ) {
            const hasEthnicityMatch = profile.ethnicities.some((e) =>
              pR.ethnicity?.includes(e)
            );

            if (!hasEthnicityMatch) {
              return false;
            }
          }

          // gender
          if (
            profile.gender_identity &&
            pR.gender_identity &&
            !pR.gender_identity?.includes('Open to all genders')
          ) {
            const hasGenderMatch = pR.gender_identity?.includes(
              profile.gender_identity
            );

            if (!hasGenderMatch) {
              return false;
            }
          }

          // age range
          if (
            profile.age_ranges &&
            pR.age_range &&
            !pR.age_range?.includes('Open to all ages')
          ) {
            const hasAgeMatch = profile.age_ranges.some((a) =>
              pR.age_range?.includes(a)
            );

            if (!hasAgeMatch) {
              return false;
            }
          }

          return pR;
        });

        currProdRoles.forEach((role) => {
          roles.push({
            ...role,
            productionId: currProd.production_id
          });
        });
      }
    }
  } catch (error) {
    console.error('Error fetching roles for talent:', error);
  }

  return roles;
}

export const getProfileWithUid = async (
  firebaseStore: Firestore,
  accountId: string
) => {
  const profileQuery = query(
    collection(firebaseStore, 'profiles'),
    where('uid', '==', accountId),
    limit(1)
  );
  const queryProfileSnapshot = await getDocs(profileQuery);

  if (queryProfileSnapshot.empty) {
    console.error('No profile found!');
    return false;
  }

  return queryProfileSnapshot.docs[0].data();
};
