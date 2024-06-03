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
  const [filters, setFilters] = useState<MatchingFilters>({
    // the only required filter we need to start is account type
    type: 'individual'
  });
  const [production, setProduction] = useState<Production>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentRoleId, setCurrentRoleId] = useState<string>();

  // get production and roles
  useEffect(() => {
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

  // get matches
  useEffect(() => {
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
