import React from 'react';
import Container from 'react-bootstrap/Container';
import { MatchesFilterBar } from './MatchesFilterBar';
import { MatchesList } from './MatchesList';

export const MatchesPageContainer = () => {
  return (
    <Container>
      <div className="flex gap-12 -mx-[15px] pt-3">
        <div className="flex-none">
          <MatchesFilterBar />
        </div>
        <div className="flex-1">
          <MatchesList />
        </div>
      </div>
    </Container>
  );
};
