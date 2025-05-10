import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PaginationContextType {
  // Track pagination state for different routes
  paginationState: {
    [key: string]: {
      currentPage: number;
      scrollPosition?: number;
    };
  };
  // Save pagination state for a route
  savePaginationState: (
    route: string,
    page: number,
    scrollPosition?: number
  ) => void;
  // Get pagination state for a route
  getPaginationState: (route: string) => {
    currentPage: number;
    scrollPosition?: number;
  };
}

const defaultContext: PaginationContextType = {
  paginationState: {},
  savePaginationState: (
    route: string,
    page: number,
    scrollPosition?: number
  ) => {
    // This is just a placeholder implementation for the default context
    // The actual implementation is provided by the PaginationProvider
    console.log(
      `Default savePaginationState called with: ${route}, ${page}, ${scrollPosition}`
    );
  },
  getPaginationState: () => ({ currentPage: 1 })
};

const PaginationContext = createContext<PaginationContextType>(defaultContext);

export const usePagination = () => useContext(PaginationContext);

export const PaginationProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [paginationState, setPaginationState] = useState<{
    [key: string]: {
      currentPage: number;
      scrollPosition?: number;
    };
  }>({});

  const savePaginationState = (
    route: string,
    page: number,
    scrollPosition?: number
  ) => {
    setPaginationState((prev) => ({
      ...prev,
      [route]: {
        currentPage: page,
        scrollPosition
      }
    }));
  };

  const getPaginationState = (route: string) => {
    return paginationState[route] || { currentPage: 1 };
  };

  return (
    <PaginationContext.Provider
      value={{
        paginationState,
        savePaginationState,
        getPaginationState
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
};
