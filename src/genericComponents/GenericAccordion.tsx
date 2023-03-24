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
      <Accordion.Item eventKey={eventKey || '0'}>
        <CardHeader>
          {textHeader}
          <Accordion.Button as={Button} variant="button">
            <CaretDownFill />
          </Accordion.Button>
        </CardHeader>
        <Accordion.Body>
          <Card.Body>{children}</Card.Body>
        </Accordion.Body>
      </Accordion.Item>
    </CardHolder>
  );
};

const CardHolder = styled(Accordion.Item)`
  box-shadow: 2px 2px 10px #00000029;
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
