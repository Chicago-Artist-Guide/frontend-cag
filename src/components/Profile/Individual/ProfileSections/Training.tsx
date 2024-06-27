import React, { useState } from 'react';
import styled from 'styled-components';
import { colors } from '../../../../theme/styleVars';
import { Container } from 'styled-bootstrap-grid';
import { hasNonEmptyValues } from '../../../../utils/hasNonEmptyValues';

const Training: React.FC<{
  training_institutions: any;
  trainingInstitution: string;
  trainingDegree: string;
  trainingYear: string;
}> = ({
  training_institutions,
  trainingInstitution,
  trainingDegree,
  trainingYear
}) => {
  let trainings = [];
  let singleTraining = null;
  if (trainingInstitution) {
    singleTraining = {
      trainingInstitution: trainingInstitution,
      trainingDegree: trainingDegree,
      trainingYear: trainingYear
    };
    trainings.push(singleTraining);
  }
  if (hasNonEmptyValues(training_institutions)) {
    trainings = trainings.concat(training_institutions);
  }
  console.log(trainings);
  return (
    <>
      {hasNonEmptyValues(trainings) && (
        <Container>
          {trainings.map((training: any) => (
            <div>
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
