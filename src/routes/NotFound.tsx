import React from 'react';
import styled from 'styled-components';
import PageContainer from '../components/layout/PageContainer';
import { Title, TitleThree, TitleTwo } from '../components/layout/Titles';

const NotFound = () => (
  <FullSceenContainer>
    <CenterDiv>
      <Title>THIS PAGE IS NOT AVAILABLE</Title>
      <TitleTwo>
        Return to <a href="/">Chicago Artist Guide</a>
      </TitleTwo>
      <div className="mt-5">
        <TitleThree>
          "Memory, all alone in the moonlight, I can smile at the old days, I
          was beautiful then. I remember the time I knew what happiness was, let
          the memory live again."
        </TitleThree>
        <TitleThree>Cats</TitleThree>
      </div>
    </CenterDiv>
  </FullSceenContainer>
);

const FullSceenContainer = styled(PageContainer)`
  margin-top: 20rem;
  margin-bottom: 20rem;
`;

const CenterDiv = styled.div`
  text-align: center;
`;

export default NotFound;
