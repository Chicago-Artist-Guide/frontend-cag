import React, { useState } from 'react';
import styled from 'styled-components';
import { colors } from '../../../../../theme/styleVars';
import { Container } from 'styled-bootstrap-grid';
import Row from 'react-bootstrap/Row';

const TrainingEdit: React.FC<{
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
  let trainings = training_institutions;
  const singleTraining = {
    trainingInstitution: trainingInstitution,
    trainingDegree: trainingDegree,
    trainingYear: trainingYear
  };
  if (trainingInstitution) {
    trainings = training_institutions.concat(singleTraining);
  }
  return <div>Hello</div>;
};

const TrainingRow = styled(Row)`
  padding-top: 2em;
  padding-bottom: 2em;

  &:not(:first-child) {
    border-top: 1px solid ${colors.lightGrey};
  }
`;

export default TrainingEdit;

/* 
{editMode['training'] ? (
              <Container>
                {(hasNonEmptyValues(editProfile?.training_institutions)
                  ? editProfile.training_institutions
                  : profile?.data?.training_institution &&
                    profile.data.training_institution !== ''
                  ? [
                      {
                        trainingInstitution: profile.data.training_institution,
                        trainingCity: profile.data.training_city,
                        trainingState: profile.data.training_state,
                        trainingDegree: profile.data.training_degree,
                        trainingDetails: profile.data.training_details
                      }
                    ]
                  : [{}]
                ).map((training: any, i: number) => (
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
                        {i + 1 ? (
                          <DeleteRowLink
                            href="#"
                            onClick={(e: any) =>
                              removeTrainingBlock(e, training.id)
                            }
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
                    <a
                      href="#"
                      onClick={(e: any) => {
                        e.preventDefault();
                        addTrainingBlock();
                      }}
                    >
                      + Save and add another institution
                    </a>
                  </Col>
                </Row>
                <Row>
                  <Col lg="12">
                    <ProfileFlex>
                      <Button
                        onClick={() =>
                          updateMultiSection(
                            'training_institutions',
                            'training'
                          )
                        }
                        text="Save"
                        type="button"
                        variant="primary"
                      />
                      <Button
                        onClick={(e: React.MouseEvent<HTMLElement>) =>
                          onEditModeClick(e, 'training', !editMode['training'])
                        }
                        text="Cancel"
                        type="button"
                        variant="secondary"
                      />
                    </ProfileFlex>
                  </Col>
                </Row>
              </Container>
            ) : (
              <>
                {hasNonEmptyValues(profile?.data?.training_institutions) && (
                  <DetailSection title="Training">
                    <Training
                      training_institutions={
                        profile?.data?.training_institutions
                      }
                      editMode={editProfile?.['training_institutions']}
                    />
                  </DetailSection>
                )}
                <a
                  href="#"
                  onClick={(e: React.MouseEvent<HTMLElement>) =>
                    onEditModeClick(e, 'training', !editMode['training'])
                  }
                >
                  + Add Training
                </a>
              </>
            )}
*/
