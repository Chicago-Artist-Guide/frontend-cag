import React, { useEffect, useState } from 'react';
import { useRoleMatches } from '../../context/RoleMatchContext';
import { Production } from '../Profile/Company/types';
import { ProductionRole } from './types';

export const CompanyMatchCard = ({ role }: { role: ProductionRole }) => {
  const { findProduction } = useRoleMatches();
  const [production, setProduction] = useState<Production | null>(null);

  useEffect(() => {
    findProduction(role.productionId).then((p) => setProduction(p));
  }, [role]);

  console.log(production);

  return (
    <div>
      <p>CompanyMatchCard: {role.role_id}</p>
    </div>
  );
};
