import React from 'react';

type MatchesPageContainerType = {
  matchingType: 'company' | 'individual';
};

export const MatchesPageContainer: React.FC<MatchesPageContainerType> = ({
  matchingType
}) => {
  return (
    <div>
      <h1>Matches</h1>
      <div>MatchesFilterBar</div>
      <div>MatchesList</div>
    </div>
  );
};
