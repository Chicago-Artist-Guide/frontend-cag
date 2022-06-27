import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { CaretDownFill } from 'react-bootstrap-icons';
import styled from 'styled-components';

const GenericAccordion = (props: any) => {
  const { children, textHeader, eventKey } = props;

  return (
    <CardHolder>
      <Accordion.Collapse eventKey={eventKey || '0'}>
        <Card.Body>{children}</Card.Body>
      </Accordion.Collapse>
      <CardHeader>
        {textHeader}
        <Accordion.Toggle
          as={Button}
          eventKey={eventKey || '0'}
          variant="button"
        >
          <CaretDownFill />
        </Accordion.Toggle>
      </CardHeader>
    </CardHolder>
  );
};

const CardHolder = styled(Card)`
  flex-direction: column-reverse;
  .show + .card-header {
    button svg {
      transform: scaleY(-1);
    }
  }
`;

const CardHeader = styled(Card.Header)`
  display: flex;
  justify-content: space-between;
  background-color: white;
`;

export default GenericAccordion;
