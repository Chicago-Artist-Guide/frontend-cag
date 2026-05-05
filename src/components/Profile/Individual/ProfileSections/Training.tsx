import React from 'react';
import { Container } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import { hasNonEmptyValues } from '../../../../utils/hasNonEmptyValues';

const Training: React.FC<
  React.PropsWithChildren<{
    training_institutions: any;
  }>
> = ({ training_institutions }) => {
  return (
    <>
      {hasNonEmptyValues(training_institutions) && (
        <Container>
          {training_institutions.map((training: any) => (
            <div key={training.id}>
              <div className="mt-[25px] flex justify-between font-bold">
                <Bold>{training.trainingInstitution}</Bold>
                <Bold>{training.trainingYear}</Bold>
              </div>
              <p className="text-[20px]">{training.trainingDegree}</p>
            </div>
          ))}
        </Container>
      )}
    </>
  );
};
const Bold = styled.p`
  font-weight: bolder;
`;
export default Training;
