/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useMatches } from '../../context/MatchContext';
import { CompanyMatchCard } from './CompanyMatchCard';

// TODO: fix "m as any" when Role matches are supported
export const CompanyMatchList = () => {
  const { matches } = useMatches();

  return (
    <div>
      {matches.map((m) => (
        <CompanyMatchCard
          key={`${(m as any).role_id}-CompanyMatchCard`}
          role={m}
        />
      ))}
    </div>
  );
};
