/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useRoleMatches } from '../../context/RoleMatchContext';
import { CompanyMatchCard } from './CompanyMatchCard';
import { ProductionRole } from './types';

export const CompanyMatchList = () => {
  const { roles } = useRoleMatches();

  return (
    <div>
      {roles.map((r: ProductionRole) => (
        <CompanyMatchCard key={`${r.role_id}-CompanyMatchCard`} role={r} />
      ))}
    </div>
  );
};
