import React, { useState } from 'react';
import styled from 'styled-components';
import { colors } from '../../../../../theme/styleVars';
import { Container } from 'styled-bootstrap-grid';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { InputField } from '../../../../../genericComponents';

const TrainingEdit: React.FC<{
  training_institutions: any;
  onTrainingFieldChange: any;
  removeTrainingBlock: (e: any, id: number) => void;
}> = ({
  training_institutions,
  onTrainingFieldChange,
  removeTrainingBlock
}) => {
  console.log(training_institutions);
  return (
    <Container>
      {training_institutions.map((training: any, index: number) => (
        <TrainingRow key={`training-${training.id}`}>
          <Col lg="8">
            <Form>
              <InputField
                name="trainingInstitution"
                onChange={(e: any) =>
                  onTrainingFieldChange(
                    'trainingInstitution',
                    e.target.value,
                    training.id
                  )
                }
                placeholder="Institution"
                value={training.trainingInstitution}
              />
              <InputField
                name="trainingYear"
                onChange={(e: any) =>
                  onTrainingFieldChange(
                    'trainingYear',
                    e.target.value,
                    training.id
                  )
                }
                placeholder="Year"
                value={training.trainingYear}
              />
              <InputField
                name="trainingDegree"
                onChange={(e: any) =>
                  onTrainingFieldChange(
                    'trainingDegree',
                    e.target.value,
                    training.id
                  )
                }
                placeholder="Degree"
                value={training.trainingDegree}
              />
              {training_institutions.length > 1 && (
                <DeleteRowLink
                  href="#"
                  onClick={(e: any) => removeTrainingBlock(e, training.id)}
                >
                  X Delete
                </DeleteRowLink>
              )}
            </Form>
          </Col>
        </TrainingRow>
      ))}
    </Container>
  );
};

const TrainingRow = styled(Row)`
  padding-top: 2em;
  padding-bottom: 2em;

  &:not(:first-child) {
    border-top: 1px solid ${colors.lightGrey};
  }
`;

const DeleteRowLink = styled.a`
  color: ${colors.salmon};
  display: block;
  margin-top: 1em;

  &:hover {
    color: ${colors.salmon};
  }
`;

export default TrainingEdit;
