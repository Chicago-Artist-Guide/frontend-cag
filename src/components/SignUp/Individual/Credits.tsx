import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { Tagline, Title } from '../../layout/Titles';
import InputField from '../../../genericComponents/Input';
import { colors } from '../../../theme/styleVars';
import type { IndividualProfile2Data, PastPerformances } from './types';
import 'react-datepicker/dist/react-datepicker.css';

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
        group: '',
        location: '',
        startDate: '',
        endDate: '',
        url: '',
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
          <Title>ADD YOUR PAST PERFORMANCES</Title>
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
                name="group"
                onChange={(e: any) =>
                  onCreditFieldChange('location', e.target.value, credit.id)
                }
                placeholder="Theatre or Location"
                value={credit.location}
              />
              <InputField
                name="url"
                onChange={(e: any) =>
                  onCreditFieldChange('url', e.target.value, credit.id)
                }
                placeholder="Web Link"
                value={credit.url}
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
            <DateRowTitle>Running Dates</DateRowTitle>
            <DateRow>
              <DatePicker
                name="startDate"
                onChange={(date: any) => {
                  const dateString = new Date(date).toLocaleDateString();
                  onCreditFieldChange('startDate', dateString, credit.id);
                }}
                value={credit.startDate}
              />
              <h6>through</h6>
              <DatePicker
                name="endDate"
                onChange={(date: any) => {
                  const dateString = new Date(date).toLocaleDateString();
                  onCreditFieldChange('endDate', dateString, credit.id);
                }}
                value={credit.endDate}
              />
            </DateRow>
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
            + Save and add another past performance
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

const DateRowTitle = styled.h5`
  margin-top: 20px;
  padding-bottom: 8px;
`;

const DateRow = styled.div`
  display: flex;
  gap: 1em;
`;

export default Credits;
