import React from 'react';
import { useMatches } from '../../context/MatchContext';
import { TalentMatchList } from './TalentMatchList';
import { CompanyMatchList } from './CompanyMatchList';

export const MatchesList = () => {
  const { filters } = useMatches();

  return (
    <div>
      {filters.type === 'individual' ? (
        <TalentMatchList />
      ) : (
        <CompanyMatchList />
      )}
    </div>
  );
};
