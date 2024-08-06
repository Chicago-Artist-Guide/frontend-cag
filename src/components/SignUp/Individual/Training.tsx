import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { Tagline, Title } from '../../layout/Titles';
import InputField from '../../../genericComponents/Input';
import { colors } from '../../../theme/styleVars';
import { CAGFormSelect } from '../SignUpStyles';
import type { USStateSymbol } from '../types';
import type { IndividualProfile2Data, TrainingInstitution } from './types';

const Training: React.FC<{
  setForm: SetForm;
  formData: IndividualProfile2Data;
}> = (props) => {
  const { setForm, formData } = props;
  const { trainingInstitutions } = formData;
  const [trainingId, setTrainingId] = useState(1);

  const setTrainingInputs = (creditTrainingBlocks: any) => {
    const target = {
      name: 'trainingInstitutions',
      value: creditTrainingBlocks
    };

    setForm({ target });
  };

  const onTrainingFieldChange = <T extends keyof TrainingInstitution>(
    fieldName: T,
    fieldValue: TrainingInstitution[T],
    id: number
  ) => {
    const newTrainings = [...trainingInstitutions];
    const findIndex = newTrainings.findIndex((training) => training.id === id);
    newTrainings[findIndex][fieldName] = fieldValue;

    setTrainingInputs(newTrainings);
  };

  const removeTrainingBlock = (e: any, id: number) => {
    e.preventDefault();
    const newTrainings = [...trainingInstitutions];
    const findIndex = newTrainings.findIndex((training) => training.id === id);
    newTrainings.splice(findIndex, 1);

    setTrainingInputs(newTrainings);
  };

  const addTrainingBlock = () => {
    const newTrainingId = trainingId + 1;

    setTrainingInputs([
      ...trainingInstitutions,
      {
        id: newTrainingId,
        trainingInstitution: '',
        trainingCity: '',
        trainingState: '' as USStateSymbol,
        trainingDegree: '',
        trainingDetails: ''
      }
    ]);

    setTrainingId(newTrainingId);
  };

  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ADD YOUR TRAINING DETAILS</Title>
          <Tagline>Tell us where you learned to do what you do.</Tagline>
        </Col>
      </Row>
      {trainingInstitutions.map((training: any, i: number) => (
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
              {i ? (
                <DeleteRowLink
                  href="#"
                  onClick={(e: any) => removeTrainingBlock(e, training.id)}
                >
                  X Delete
                </DeleteRowLink>
              ) : null}
            </Form>
          </Col>
        </TrainingRow>
      ))}
      <Row>
        <Col lg="10">
          <SaveAndAddLink
            href="#"
            onClick={(e: any) => {
              e.preventDefault();
              addTrainingBlock();
            }}
          >
            + Save and add another institution
          </SaveAndAddLink>
        </Col>
      </Row>
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

const PaddedCol = styled(Col)`
  padding-left: 0;
`;

const SmallTitle = styled.h3`
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: ${colors.dark};
`;

const DeleteRowLink = styled.a`
  color: ${colors.salmon};
  display: block;
  margin-top: 1em;

  &:hover {
    color: ${colors.salmon};
  }
`;

const SaveAndAddLink = styled.a`
  display: block;
  margin-top: 1em;
`;

export default Training;
