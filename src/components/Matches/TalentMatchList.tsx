import React from 'react';
import { useMatches } from '../../context/MatchContext';
import { TalentMatchCard } from './TalentMatchCard';

export const TalentMatchList = () => {
  const { matches } = useMatches();

  return (
    <div>
      {matches.map((m) => (
        <TalentMatchCard key={`${m.uid}-TalentMatchCard`} profile={m} />
      ))}
    </div>
  );
};
