import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import 'react-datepicker/dist/react-datepicker.css';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import InputField from '../../../components/shared/Input';
import { colors } from '../../../theme/styleVars';
import { Tagline, Title } from '../../layout/Titles';
import type { IndividualProfile2Data, PastPerformances } from './types';

const Credits: React.FC<{
  setForm: SetForm;
  formData: IndividualProfile2Data;
}> = (props) => {
  const { setForm, formData } = props;
  const { pastPerformances } = formData;
  const [showId, setShowId] = useState(1);

  const setCreditInputs = (creditInputBlocks: any) => {
    const target = {
      name: 'pastPerformances',
      value: creditInputBlocks
    };

    setForm({ target });
  };

  const onCreditFieldChange = <T extends keyof PastPerformances>(
    fieldName: T,
    fieldValue: PastPerformances[T],
    id: number
  ) => {
    const newCredits = [...pastPerformances];
    const findIndex = newCredits.findIndex((show) => show.id === id);
    newCredits[findIndex][fieldName] = fieldValue;

    setCreditInputs(newCredits);
  };

  const removeCreditBlock = (e: any, id: number) => {
    e.preventDefault();
    const newCredits = [...pastPerformances];
    const findIndex = newCredits.findIndex((show) => show.id === id);
    newCredits.splice(findIndex, 1);

    setCreditInputs(newCredits);
  };

  const addCreditBlock = () => {
    const newShowId = showId + 1;

    setCreditInputs([
      ...pastPerformances,
      {
        id: newShowId,
        title: '',
        year: '',
        group: '',
        role: '',
        director: '',
        musicalDirector: ''
      }
    ]);

    setShowId(newShowId);
  };

  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ADD YOUR PREVIOUS PRODUCTIONS</Title>
          <Tagline>Where might we have seen you?</Tagline>
        </Col>
      </Row>
      {pastPerformances.map((credit: any, i: number) => (
        <PerfRow key={`credit-${credit.id}`}>
          <Col lg="4">
            <Form>
              <InputField
                name="title"
                onChange={(e: any) =>
                  onCreditFieldChange('title', e.target.value, credit.id)
                }
                placeholder="Show Title"
                value={credit.title}
              />
              <InputField
                name="role"
                onChange={(e: any) =>
                  onCreditFieldChange('role', e.target.value, credit.id)
                }
                placeholder="Role/Position"
                value={credit.role}
              />
              <InputField
                name="director"
                onChange={(e: any) =>
                  onCreditFieldChange('director', e.target.value, credit.id)
                }
                placeholder="Director"
                value={credit.director}
              />
              <InputField
                name="musicalDirector"
                onChange={(e: any) =>
                  onCreditFieldChange(
                    'musicalDirector',
                    e.target.value,
                    credit.id
                  )
                }
                placeholder="Musical Director"
                value={credit.musicalDirector}
              />
            </Form>
            {i ? (
              <DeleteRowLink
                href="#"
                onClick={(e: any) => removeCreditBlock(e, credit.id)}
              >
                X Delete
              </DeleteRowLink>
            ) : null}
          </Col>
          <Col lg="4">
            <InputField
              name="group"
              onChange={(e: any) =>
                onCreditFieldChange('group', e.target.value, credit.id)
              }
              placeholder="Theatre Group"
              value={credit.group}
            />
          </Col>
        </PerfRow>
      ))}
      <Row>
        <Col lg="10">
          <SaveAndAddLink
            href="#"
            onClick={(e: any) => {
              e.preventDefault();
              addCreditBlock();
            }}
          >
            + Save and add another previous production
          </SaveAndAddLink>
        </Col>
      </Row>
    </Container>
  );
};

const PerfRow = styled(Row)`
  padding-top: 2em;
  padding-bottom: 2em;

  &:not(:first-child) {
    border-top: 1px solid ${colors.lightGrey};
  }
`;

const SaveAndAddLink = styled.a`
  display: block;
  margin-top: 1em;
`;

const DeleteRowLink = styled.a`
  color: ${colors.salmon};
  display: block;
  margin-top: 1em;

  &:hover {
    color: ${colors.salmon};
  }
`;

export default Credits;
