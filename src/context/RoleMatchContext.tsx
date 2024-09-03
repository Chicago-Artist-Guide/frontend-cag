import { Firestore } from 'firebase/firestore';
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect
} from 'react';
import { useUserContext } from './UserContext';
import { Production } from '../components/Profile/Company/types';
import { getProduction } from '../components/Profile/Company/api';
import { fetchRolesForTalent } from '../components/Matches/api';
import { ProductionRole } from '../components/Matches/types';

interface RoleMatchContextValue {
  productions: { [key: string]: Production };
  roles: ProductionRole[];
  loading: boolean;
  findProduction: (productionId: string) => Promise<Production | null>;
}

interface RoleMatchProviderProps {
  firestore: Firestore;
  children: ReactNode;
}

const defaultContextValue: RoleMatchContextValue = {
  productions: {},
  roles: [],
  loading: true,
  findProduction: async () => null
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
  const [productions, setProductions] = useState<{ [key: string]: Production }>(
    {}
  );
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

  const findProduction = async (
    productionId: string
  ): Promise<Production | null> => {
    if (productions[productionId]) {
      return productions[productionId];
    }

    try {
      const production = await getProduction(firestore, productionId);

      if (!production) {
        throw new Error(`Could not find production with id: ${productionId}`);
      }

      setProductions((prevProductions) => ({
        ...prevProductions,
        [productionId]: production
      }));

      return production;
    } catch (error) {
      console.error('Error fetching production:', error);
      return null;
    }
  };

  const value: RoleMatchContextValue = {
    productions,
    roles,
    loading,
    findProduction
  };

  return (
    <RoleMatchContext.Provider value={value}>
      {children}
    </RoleMatchContext.Provider>
  );
};
