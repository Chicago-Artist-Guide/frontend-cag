import { Firestore } from 'firebase/firestore';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { fetchTalentWithFilters } from '../utils/firebaseUtils';
import { IndividualProfileDataFullInit } from '../components/SignUp/Individual/types';
import { MatchingFilters } from '../components/Matches/types';

// TODO: broaden "matches" typing to support profiles OR roles
interface MatchContextValue {
  matches: IndividualProfileDataFullInit[];
  loading: boolean;
  filters: MatchingFilters;
  updateFilters: (newFilters: MatchingFilters) => void;
}

type MatchProviderProps = {
  firestore: Firestore;
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
  children
}) => {
  const [matches, setMatches] = useState<IndividualProfileDataFullInit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MatchingFilters>({
    // the only required filter we need to start is account type
    type: 'individual'
  });

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
    updateFilters
  };

  return (
    <MatchContext.Provider value={value}>{children}</MatchContext.Provider>
  );
};
