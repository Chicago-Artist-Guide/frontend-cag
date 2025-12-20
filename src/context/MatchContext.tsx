import { Firestore } from 'firebase/firestore';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTalentWithFilters } from '../components/Matches/api';
import { getProduction } from '../components/Profile/Company/api';
import { IndividualProfileDataFullInit } from '../components/SignUp/Individual/types';
import { MatchingFilters } from '../components/Matches/types';
import { Production, Role } from '../components/Profile/Company/types';
import {
  IndividualRoles,
  Gender,
  AgeRange,
  SkillCheckbox
} from '../components/SignUp/Individual/types';
import {
  findCategoryByValue,
  OffstageCategoryKey,
  findOffstageCategoryDataProp
} from '../components/Profile/shared/offstageRolesOptions';

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
  roleIdParam?: string;
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
  roleIdParam,
  children
}) => {
  const navigate = useNavigate();
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
      const genderCatchAll = 'Open to all genders';
      const roleGenders = findRole.gender_identity.filter(
        (g) => g !== genderCatchAll
      );

      if (roleGenders.length > 0) {
        // Map role genders to artist profile genders for initial query
        // We'll include Trans/Nonbinary and do finer filtering post-fetch
        const profileGenders: Gender[] = [];

        if (roleGenders.includes('Woman')) {
          profileGenders.push('Cis Woman');
          profileGenders.push('Trans/Nonbinary');
        }
        if (roleGenders.includes('Man')) {
          profileGenders.push('Cis Man');
          profileGenders.push('Trans/Nonbinary');
        }
        // If include_nonbinary is set, Trans/Nonbinary with Nonbinary role interest also matches
        if (findRole.include_nonbinary) {
          if (!profileGenders.includes('Trans/Nonbinary')) {
            profileGenders.push('Trans/Nonbinary');
          }
        }

        // Remove duplicates
        newFilters['gender_identity'] = [...new Set(profileGenders)];
      }
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

    // Add singing/dancing requirements to filters
    if (findRole.additional_requirements) {
      const skills: SkillCheckbox[] = [];
      if (findRole.additional_requirements.includes('Requires singing')) {
        skills.push('Singing');
      }
      if (findRole.additional_requirements.includes('Requires dancing')) {
        skills.push('Dancing');
      }
      if (skills.length > 0) {
        newFilters['additional_skills_checkboxes'] = skills;
      }
    }

    // Union status - filter talent by role's union requirements
    if (
      findRole.union &&
      Array.isArray(findRole.union) &&
      findRole.union.length > 0
    ) {
      newFilters['union_status'] = findRole.union;
    }

    setFilters(newFilters);
    return newFilters;
  };

  // get production and roles
  useEffect(() => {
    if (!productionId) {
      return;
    }

    setLoading(true);

    getProduction(firestore, productionId).then((p) => {
      if (!p) {
        return;
      }

      setProduction(p);

      if (p.roles) {
        setRoles(p.roles);
        setCurrentRoleId(roleIdParam ?? p.roles[0].role_id);
      }
    });
  }, [productionId, roleIdParam]);

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
    navigate(`/profile/search/talent/${productionId}/${currentRoleId}`);
  }, [currentRoleId]);

  // get matches
  useEffect(() => {
    if (foundRole === 'loading' || !production || !currentRoleId) {
      return;
    }

    setLoading(true);

    fetchTalentWithFilters(
      firestore,
      filters,
      production.production_id,
      currentRoleId
    ).then((filteredMatches) => {
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
