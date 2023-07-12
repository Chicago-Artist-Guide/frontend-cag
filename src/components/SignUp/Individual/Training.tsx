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
              <Container>
                <Row>
                  <PaddedCol lg="8">
                    <InputField
                      name="trainingCity"
                      onChange={(e: any) =>
                        onTrainingFieldChange(
                          'trainingCity',
                          e.target.value,
                          training.id
                        )
                      }
                      placeholder="City"
                      value={training.trainingCity}
                    />
                  </PaddedCol>
                  <PaddedCol lg="4">
                    <CAGFormSelect
                      name="trainingState"
                      onChange={(e: any) =>
                        onTrainingFieldChange(
                          'trainingState',
                          e.target.value,
                          training.id
                        )
                      }
                      value={training.trainingState || ''}
                      style={{
                        height: 52,
                        marginTop: 'calc(25px + 0.5rem)',
                        border: `1px solid ${colors.lightGrey}`,
                        color: training.trainingState
                          ? colors.secondaryFontColor
                          : colors.lightGrey
                      }}
                    >
                      <option value="">State</option>
                      <option value="AL">Alabama</option>
                      <option value="AK">Alaska</option>
                      <option value="AZ">Arizona</option>
                      <option value="AR">Arkansas</option>
                      <option value="CA">California</option>
                      <option value="CO">Colorado</option>
                      <option value="CT">Connecticut</option>
                      <option value="DE">Delaware</option>
                      <option value="DC">District Of Columbia</option>
                      <option value="FL">Florida</option>
                      <option value="GA">Georgia</option>
                      <option value="HI">Hawaii</option>
                      <option value="ID">Idaho</option>
                      <option value="IL">Illinois</option>
                      <option value="IN">Indiana</option>
                      <option value="IA">Iowa</option>
                      <option value="KS">Kansas</option>
                      <option value="KY">Kentucky</option>
                      <option value="LA">Louisiana</option>
                      <option value="ME">Maine</option>
                      <option value="MD">Maryland</option>
                      <option value="MA">Massachusetts</option>
                      <option value="MI">Michigan</option>
                      <option value="MN">Minnesota</option>
                      <option value="MS">Mississippi</option>
                      <option value="MO">Missouri</option>
                      <option value="MT">Montana</option>
                      <option value="NE">Nebraska</option>
                      <option value="NV">Nevada</option>
                      <option value="NH">New Hampshire</option>
                      <option value="NJ">New Jersey</option>
                      <option value="NM">New Mexico</option>
                      <option value="NY">New York</option>
                      <option value="NC">North Carolina</option>
                      <option value="ND">North Dakota</option>
                      <option value="OH">Ohio</option>
                      <option value="OK">Oklahoma</option>
                      <option value="OR">Oregon</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="RI">Rhode Island</option>
                      <option value="SC">South Carolina</option>
                      <option value="SD">South Dakota</option>
                      <option value="TN">Tennessee</option>
                      <option value="TX">Texas</option>
                      <option value="UT">Utah</option>
                      <option value="VT">Vermont</option>
                      <option value="VA">Virginia</option>
                      <option value="WA">Washington</option>
                      <option value="WV">West Virginia</option>
                      <option value="WI">Wisconsin</option>
                      <option value="WY">Wyoming</option>
                    </CAGFormSelect>
                  </PaddedCol>
                </Row>
              </Container>
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
              <Container>
                <Row>
                  <PaddedCol className="mt-4" lg="12">
                    <SmallTitle>Notes/Details</SmallTitle>
                    <Form.Group controlId="formControlTextarea1">
                      <Form.Control
                        as="textarea"
                        name="trainingDetails"
                        onChange={(e: any) =>
                          onTrainingFieldChange(
                            'trainingDetails',
                            e.target.value,
                            training.id
                          )
                        }
                        placeholder="Provide any additional information here"
                        rows={6}
                        value={training.trainingDetails || ''}
                      />
                    </Form.Group>
                  </PaddedCol>
                </Row>
              </Container>
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
