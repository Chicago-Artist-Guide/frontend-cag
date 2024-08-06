import React, { useState } from 'react';
import styled from 'styled-components';
import { colors } from '../../../../theme/styleVars';
import { Container } from 'styled-bootstrap-grid';
import { hasNonEmptyValues } from '../../../../utils/hasNonEmptyValues';

const Training: React.FC<{
  training_institutions: any;
}> = ({ training_institutions }) => {
  return (
    <>
      {hasNonEmptyValues(training_institutions) && (
        <Container>
          {training_institutions.map((training: any) => (
            <div key={training.id}>
              <DegreeInformation>
                <Bold>{training.trainingInstitution}</Bold>
                <Bold>{training.trainingYear}</Bold>
              </DegreeInformation>
              <Degree>{training.trainingDegree}</Degree>
            </div>
          ))}
        </Container>
      )}
    </>
  );
};

const DegreeInformation = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-top: 25px;
`;

const Bold = styled.p`
  font-weight: bolder;
`;

const Degree = styled.p`
  font-size: 20px;
`;

export default Training;
