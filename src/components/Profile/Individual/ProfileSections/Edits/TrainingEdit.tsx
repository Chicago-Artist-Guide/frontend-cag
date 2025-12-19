import React from 'react';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { Container } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import { InputField } from '../../../../../components/shared';
import { colors, breakpoints } from '../../../../../theme/styleVars';

const TrainingEdit: React.FC<{
  training_institutions: any;
  onTrainingFieldChange: any;
  removeTrainingBlock: (e: any, id: number) => void;
}> = ({
  training_institutions,
  onTrainingFieldChange,
  removeTrainingBlock
}) => {
  return (
    <Container>
      {training_institutions.map((training: any) => (
        <TrainingRow key={`training-${training.id}`}>
          <Col lg="8" xs="12">
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
                value={training.trainingInstitution || ''}
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
                value={training.trainingYear || ''}
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
                value={training.trainingDegree || ''}
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

  @media (max-width: ${breakpoints.md}) {
    padding-top: 1.5em;
    padding-bottom: 1.5em;
  }
`;

const DeleteRowLink = styled.a`
  color: ${colors.salmon};
  display: block;
  margin-top: 1em;
  min-height: 44px;
  display: flex;
  align-items: center;
  font-weight: 500;

  &:hover {
    color: ${colors.salmon};
    opacity: 0.8;
  }

  @media (max-width: ${breakpoints.md}) {
    margin-top: 1.5em;
    padding: 8px 0;
    font-size: 16px;
  }
`;

export default TrainingEdit;
