import React from 'react';
import { useMatches } from '../../context/MatchContext';
import { TalentMatchList } from './TalentMatchList';
import { CompanyMatchList } from './CompanyMatchList';

export const MatchesList = () => {
  const { filters } = useMatches();

  return (
    <div>
      <h2>{filters.type === 'individual' ? 'Talent' : 'Role'} Results</h2>
      {filters.type === 'individual' ? (
        <TalentMatchList />
      ) : (
        <CompanyMatchList />
      )}
    </div>
  );
};
