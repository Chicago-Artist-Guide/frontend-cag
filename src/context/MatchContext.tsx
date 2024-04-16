import { Firestore } from 'firebase/firestore';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { fetchTalentWithFilters } from './firebaseUtils';
import { IndividualProfileDataFullInit } from '../components/SignUp/Individual/types';
import { MatchingFilters } from '../components/Matches/types';

const MatchContext = createContext({});

export function useMatches() {
  return useContext(MatchContext);
}

type MatchProviderProps = {
  firestore: Firestore;
  children: ReactNode;
};

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
    fetchTalentWithFilters(firestore, filters).then((filteredMatches) => {
      setMatches(filteredMatches);
      setLoading(false);
    });
  }, [filters]);

  const updateFilters = (newFilters: MatchingFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const value = {
    matches,
    loading,
    updateFilters
  };

  return (
    <MatchContext.Provider value={value}>{children}</MatchContext.Provider>
  );
};
