import React, { createContext, useContext } from 'react';

const AuthContext = createContext<any>({});

export const AuthProvider = ({ children, value }: any) => (
  <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
);

export const useAuthValue = () => useContext(AuthContext);
