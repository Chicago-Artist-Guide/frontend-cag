import React from 'react';
import Image from 'react-bootstrap';
import styled from 'styled-components';
import { colors } from '../../../../../theme/styleVars';
import { Col, Row, Container, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { InputField } from '../../../../../genericComponents';
import { PastPerformances } from '../../../../SignUp/Individual/types';

type CreditFieldChangeFunction = <
  T extends
    | 'title'
    | 'id'
    | 'role'
    | 'group'
    | 'url'
    | 'year'
    | 'director'
    | 'musicalDirector'
    | 'location'
    | 'startDate'
    | 'endDate'
    | 'recognition'
>(
  fieldName: T,
  fieldValue: PastPerformances[T],
  id: number
) => void;

const FeaturesEdit: React.FC<{
  features: any;
  emptyPlaceholder: string;
  onCreditFieldChange: CreditFieldChangeFunction;
  removeCreditBlock: (e: any, i: number) => void;
}> = ({
  features,
  emptyPlaceholder,
  onCreditFieldChange,
  removeCreditBlock
}) => {
  return (
    <Container>
      {features.map((credit: any, i: number) => (
        <>
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
                onCreditFieldChange('group', e.target.value, credit.id)
              }
              placeholder="Theatre Group"
              value={credit.group}
            />
            <InputField
              name="year"
              onChange={(e: any) =>
                onCreditFieldChange('year', e.target.value, credit.id)
              }
              placeholder="Year"
              value={credit.year}
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
          <hr />
        </>
      ))}
    </Container>
  );
};

const DeleteRowLink = styled.a`
  color: ${colors.salmon};
  display: block;
  margin-top: 1em;

  &:hover {
    color: ${colors.salmon};
  }
`;

export default FeaturesEdit;
