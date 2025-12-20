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
import { getProduction } from '../Profile/Company/api';
import { expandEthnicityForMatching } from '../../utils/helpers';
import {
  FILTER_ARRAYS_TO_SINGLE_VALUES_MATCHING,
  MatchingFilters,
  ProductionRole,
  TheaterOrTalent,
  TheaterTalentMatch
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
    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    } as TheaterTalentMatch;
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
      ? { status, confirmed_by: theaterOrTalent }
      : { status, rejected_by: theaterOrTalent };

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

  // Expand ethnicity filters to include subcategories if parent category is selected
  if (profileFilters.ethnicities && Array.isArray(profileFilters.ethnicities)) {
    profileFilters.ethnicities = expandEthnicityForMatching(
      profileFilters.ethnicities
    );
  }

  for (const [field, value] of Object.entries(profileFilters)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          let profileQuery = query(profilesRef);

          // if the comparison is array to single value
          if (FILTER_ARRAYS_TO_SINGLE_VALUES_MATCHING.includes(field)) {
            profileQuery = query(profileQuery, where(field, 'in', value));
          } else {
            // we know the comparison is array to array
            profileQuery = query(
              profileQuery,
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

  // Filter by role requirements if specified
  if (productionId && roleId) {
    const production = await getProduction(firebaseStore, productionId);
    if (production && production.roles) {
      const role = production.roles.find((r) => r.role_id === roleId);
      if (role) {
        let filteredMatches = matches;

        // Filter by LGBTQ+ only requirement
        if (role.lgbtq_only) {
          filteredMatches = filteredMatches.filter(
            (profile) => profile.lgbtqia === 'Yes'
          );
        }

        // Filter Trans/Nonbinary artists by their role interests
        if (
          role.gender_identity &&
          !role.gender_identity.includes('Open to all genders')
        ) {
          const roleGender = role.gender_identity[0]; // Now single selection

          filteredMatches = filteredMatches.filter((profile) => {
            // "I choose not to respond" only matches "Open to all genders"
            if (profile.gender_identity === 'I choose not to respond') {
              return false;
            }

            // Cis Woman/Man match directly
            if (
              profile.gender_identity === 'Cis Woman' &&
              roleGender === 'Woman'
            ) {
              return true;
            }
            if (profile.gender_identity === 'Cis Man' && roleGender === 'Man') {
              return true;
            }

            // Trans/Nonbinary needs to have matching role interest
            if (profile.gender_identity === 'Trans/Nonbinary') {
              const genderRoles = profile.gender_roles || [];

              // Check if they want to play this role type
              if (roleGender === 'Woman' && genderRoles.includes('Woman')) {
                return true;
              }
              if (roleGender === 'Man' && genderRoles.includes('Man')) {
                return true;
              }

              // Check if include_nonbinary is set and they want nonbinary roles
              if (role.include_nonbinary && genderRoles.includes('Nonbinary')) {
                return true;
              }

              return false;
            }

            return false;
          });
        }

        // Filter by singing/dancing requirements
        if (role.additional_requirements) {
          const requiresSinging =
            role.additional_requirements.includes('Requires singing');
          const requiresDancing =
            role.additional_requirements.includes('Requires dancing');

          if (requiresSinging || requiresDancing) {
            filteredMatches = filteredMatches.filter((profile) => {
              const skills = profile.additional_skills_checkboxes || [];
              const hasSinging = skills.includes('Singing');
              const hasDancing = skills.includes('Dancing');

              if (requiresSinging && requiresDancing) {
                return hasSinging && hasDancing;
              } else if (requiresSinging) {
                return hasSinging;
              } else if (requiresDancing) {
                return hasDancing;
              }
              return true;
            });
          }
        }

        return filteredMatches;
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
            // Expand role ethnicities to include subcategories for umbrella matching
            const expandedRoleEthnicities = expandEthnicityForMatching(
              pR.ethnicity
            );
            const hasEthnicityMatch = profile.ethnicities.some((e) =>
              expandedRoleEthnicities?.includes(e)
            );

            if (!hasEthnicityMatch) {
              return false;
            }
          }

          // gender matching with new model
          if (
            profile.gender_identity &&
            pR.gender_identity &&
            !pR.gender_identity?.includes('Open to all genders')
          ) {
            const roleGender = pR.gender_identity[0]; // Now single selection

            // "I choose not to respond" only matches "Open to all genders"
            if (profile.gender_identity === 'I choose not to respond') {
              return false;
            }

            // Cis Woman matches Woman roles
            if (profile.gender_identity === 'Cis Woman') {
              if (roleGender !== 'Woman') {
                return false;
              }
            }

            // Cis Man matches Man roles
            if (profile.gender_identity === 'Cis Man') {
              if (roleGender !== 'Man') {
                return false;
              }
            }

            // Trans/Nonbinary matches based on their role interests
            if (profile.gender_identity === 'Trans/Nonbinary') {
              const genderRoles = profile.gender_roles || [];
              let hasMatch = false;

              // Can play Woman roles if interested
              if (roleGender === 'Woman' && genderRoles.includes('Woman')) {
                hasMatch = true;
              }

              // Can play Man roles if interested
              if (roleGender === 'Man' && genderRoles.includes('Man')) {
                hasMatch = true;
              }

              // Can play roles with include_nonbinary if interested in nonbinary roles
              if (pR.include_nonbinary && genderRoles.includes('Nonbinary')) {
                hasMatch = true;
              }

              if (!hasMatch) {
                return false;
              }
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

          // LGBTQ+ only roles
          if (pR.lgbtq_only && profile.lgbtqia !== 'Yes') {
            return false;
          }

          // Singing/dancing requirements
          if (pR.additional_requirements) {
            const skills = profile.additional_skills_checkboxes || [];
            const requiresSinging =
              pR.additional_requirements.includes('Requires singing');
            const requiresDancing =
              pR.additional_requirements.includes('Requires dancing');

            if (requiresSinging && !skills.includes('Singing')) {
              return false;
            }
            if (requiresDancing && !skills.includes('Dancing')) {
              return false;
            }
          }

          // Union matching - role union requirements vs profile union status
          if (pR.union && Array.isArray(pR.union) && pR.union.length > 0) {
            const profileUnionStatus = profile.union_status || [];

            // Check if at least one union status matches
            const hasUnionMatch = pR.union.some((roleUnion) =>
              profileUnionStatus.includes(roleUnion)
            );

            if (!hasUnionMatch) {
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
