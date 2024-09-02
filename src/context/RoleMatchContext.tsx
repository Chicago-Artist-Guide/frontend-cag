import { Firestore } from 'firebase/firestore';
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect
} from 'react';
import { useUserContext } from './UserContext';
import { fetchRolesForTalent } from '../components/Matches/api';
import { ProductionRole } from '../components/Matches/types';

interface RoleMatchContextValue {
  roles: any;
  loading: boolean;
}

interface RoleMatchProviderProps {
  firestore: Firestore;
  children: ReactNode;
}

const defaultContextValue: RoleMatchContextValue = {
  roles: [],
  loading: true
};

const RoleMatchContext =
  createContext<RoleMatchContextValue>(defaultContextValue);

export const useRoleMatches = (): RoleMatchContextValue =>
  useContext(RoleMatchContext);

export const RoleMatchProvider: React.FC<RoleMatchProviderProps> = ({
  firestore,
  children
}) => {
  const { profile } = useUserContext();
  const [roles, setRoles] = useState<ProductionRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profileData = profile.data;

    setLoading(true);
    fetchRolesForTalent(firestore, profileData).then((filteredRoles) => {
      setRoles(filteredRoles);
      setLoading(false);
    });
  }, [profile]);

  const value: RoleMatchContextValue = {
    roles,
    loading
  };

  return (
    <RoleMatchContext.Provider value={value}>
      {children}
    </RoleMatchContext.Provider>
  );
};
