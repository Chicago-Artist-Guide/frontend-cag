import React from 'react';

import { Container, Form } from 'react-bootstrap';
import styled from 'styled-components';
import { InputField } from '../../../../../components/shared';
import { colors, breakpoints } from '../../../../../theme/styleVars';

const FeaturesEdit: React.FC<{
  features: any;
  emptyPlaceholder: string;
  onCreditFieldChange: any;
  removeCreditBlock: (e: any, i: number) => void;
}> = ({ features, onCreditFieldChange, removeCreditBlock }) => {
  return (
    <Container>
      {features?.map((credit: any) => (
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
          {features?.length > 1 && (
            <DeleteRowLink
              href="#"
              onClick={(e: any) => removeCreditBlock(e, credit.id)}
            >
              X Delete
            </DeleteRowLink>
          )}
          <Divider />
        </>
      ))}
    </Container>
  );
};

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

const Divider = styled.hr`
  margin: 2em 0;

  @media (max-width: ${breakpoints.md}) {
    margin: 1.5em 0;
  }
`;

export default FeaturesEdit;
