import { Firestore } from 'firebase/firestore';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { getProduction, fetchTalentWithFilters } from '../utils/firebaseUtils';
import { IndividualProfileDataFullInit } from '../components/SignUp/Individual/types';
import { MatchingFilters } from '../components/Matches/types';
import { Production, Role } from '../components/Profile/Company/types';
import {
  IndividualRoles,
  Gender,
  AgeRange
} from '../components/SignUp/Individual/types';
import {
  findCategoryByValue,
  OffstageCategoryKey,
  findOffstageCategoryDataProp
} from '../components/Profile/shared/offstageRolesOptions';
import { set } from 'js-cookie';

// TODO: broaden "matches" typing to support profiles OR roles
interface MatchContextValue {
  matches: IndividualProfileDataFullInit[];
  loading: boolean;
  filters: MatchingFilters;
  updateFilters: (newFilters: MatchingFilters) => void;
  production?: Production;
  setProduction?: (production: Production) => void;
  roles?: Role[];
  setRoles?: (roles: Role[]) => void;
  currentRoleId?: string;
  setCurrentRoleId?: (roleId: string) => void;
}

type MatchProviderProps = {
  firestore: Firestore;
  productionId: string;
  children: ReactNode;
};

const defaultContextValue: MatchContextValue = {
  matches: [],
  loading: true,
  filters: { type: 'individual' }, // Default filters setup
  updateFilters: () => null
};

const MatchContext = createContext<MatchContextValue>(defaultContextValue);

export const useMatches = (): MatchContextValue => useContext(MatchContext);

export const MatchProvider: React.FC<MatchProviderProps> = ({
  firestore,
  productionId,
  children
}) => {
  const [matches, setMatches] = useState<IndividualProfileDataFullInit[]>([]);
  const [loading, setLoading] = useState(true);
  const [foundRole, setFoundRole] = useState<'loading' | 'found' | 'not-found'>(
    'loading'
  );
  const [filters, setFilters] = useState<MatchingFilters>({
    // the only required filter we need to start is account type
    type: 'individual'
  });
  const [production, setProduction] = useState<Production>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentRoleId, setCurrentRoleId] = useState<string>();

  const updateFiltersFromRole = (findRole: Role) => {
    const newFilters: MatchingFilters = { ...filters };

    // stage role type
    if (findRole.type) {
      newFilters['stage_role'] = [
        findRole.type.toLocaleLowerCase() as IndividualRoles,
        'both-stage'
      ];
    }

    // for offstage roles
    if (findRole.offstage_role) {
      const findOffCat = findCategoryByValue(
        findRole.offstage_role
      ) as OffstageCategoryKey;

      if (findOffCat) {
        const findOffCatDataProp = findOffstageCategoryDataProp[findOffCat];

        if (!findOffCatDataProp) {
          return;
        }

        newFilters[findOffCatDataProp] = [findRole.offstage_role];
      }
    }

    if (findRole.gender_identity) {
      newFilters['gender_identity'] = findRole.gender_identity as Gender[];
    }

    if (findRole.ethnicity) {
      const ethnicityCatchAll = 'Open to all ethnicities';
      newFilters['ethnicities'] = findRole.ethnicity.filter(
        (f) => f !== ethnicityCatchAll
      );
    }

    if (findRole.age_range) {
      const ageCatchAll = 'Open to all ages';
      newFilters['age_ranges'] = findRole.age_range.filter(
        (a) => a !== ageCatchAll
      ) as AgeRange[];
    }

    setFilters(newFilters);
    return newFilters;
  };

  // get production and roles
  useEffect(() => {
    setLoading(true);

    getProduction(firestore, productionId).then((p) => {
      if (!p) {
        return;
      }

      setProduction(p);

      if (p.roles) {
        setRoles(p.roles);
        setCurrentRoleId(p.roles[0].role_id);
      }
    });
  }, [productionId]);

  // set filters based on role
  useEffect(() => {
    if (!currentRoleId || !roles.length) {
      return;
    }

    const findRole = roles.find((r) => r.role_id === currentRoleId);

    if (!findRole) {
      setFoundRole('not-found');
      return;
    }

    setFoundRole('found');
    updateFiltersFromRole(findRole);
  }, [currentRoleId]);

  // get matches
  useEffect(() => {
    if (foundRole === 'loading') {
      return;
    }

    setLoading(true);

    // TODO: if "type" is "company", we need to update matches with fetchRolesWithFilters instead
    fetchTalentWithFilters(firestore, filters).then((filteredMatches) => {
      setMatches(filteredMatches);
      setLoading(false);
    });
  }, [filters]);

  const updateFilters = (newFilters: MatchingFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const value: MatchContextValue = {
    matches,
    loading,
    filters,
    updateFilters,
    production,
    setProduction,
    roles,
    setRoles,
    currentRoleId,
    setCurrentRoleId
  };

  return (
    <MatchContext.Provider value={value}>{children}</MatchContext.Provider>
  );
};
