import React from 'react';
import { useRoleMatches } from '../../context/RoleMatchContext';
import { CompanyMatchCard } from './CompanyMatchCard';
import { ProductionRole } from './types';

export const CompanyMatchList = () => {
  const { roles } = useRoleMatches();

  return (
    <div className="flex flex-col gap-6">
      {roles.map((role: ProductionRole) => (
        <CompanyMatchCard
          key={`${role.role_id}-CompanyMatchCard`}
          role={role}
        />
      ))}
    </div>
  );
};
