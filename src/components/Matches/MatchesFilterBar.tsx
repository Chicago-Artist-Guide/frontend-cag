import React from 'react';
import { useMatches } from '../../context/MatchContext';

export const MatchesFilterBar = () => {
  const { filters } = useMatches();

  return (
    <div>
      <h2>{filters.type === 'individual' ? 'Talent' : 'Role'} Filters</h2>
    </div>
  );
};
