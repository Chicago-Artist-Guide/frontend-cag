import { Firestore } from 'firebase/firestore';
import React, { createContext, useContext, ReactNode, useState } from 'react';

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

export const useMatches = (): RoleMatchContextValue =>
  useContext(RoleMatchContext);

export const RoleMatchProvider: React.FC<RoleMatchProviderProps> = ({
  firestore,
  children
}) => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
