import React from 'react';
import { useMatches } from '../../context/MatchContext';
import { CompanyMatchList } from './CompanyMatchList';
import { MatchesFilterBar } from './MatchesFilterBar';
import { TalentMatchList } from './TalentMatchList';

export const MatchesPageContainer = () => {
  const { filters } = useMatches();

  return (
    <div className="flex gap-12 pt-3">
      <div className="flex-none">
        <MatchesFilterBar />
      </div>
      <div className="flex-1">
        {filters.type === 'individual' ? (
          <TalentMatchList />
        ) : (
          <CompanyMatchList />
        )}
      </div>
    </div>
  );
};
