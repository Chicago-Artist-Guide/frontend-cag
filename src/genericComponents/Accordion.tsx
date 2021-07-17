import React, { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { CaretDownFill, CaretUpFill } from 'react-bootstrap-icons';
import styled from 'styled-components';

const GenericAccordion = (props: any) => {
  const { children, textHeader } = props;

  const [isOpen, setIsOpen] = useState(false);

  const arrowDirection = () => {
    if (isOpen) {
      return <CaretDownFill />;
    } else {
      return <CaretUpFill />;
    }
  };

  return (
    <Accordion1 defaultActiveKey="0" onClick={() => setIsOpen(!isOpen)}>
      <Card>
        <CardHeader>
          {textHeader}
          <Accordion.Toggle as={Button} eventKey="0" variant="button">
            {arrowDirection()}
          </Accordion.Toggle>
        </CardHeader>
        <Accordion.Collapse eventKey="0">
          <Card.Body>{children}</Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion1>
  );
};

const CardHeader = styled(Card.Header)`
  display: flex;
  justify-content: space-between;
  background-color: white;
`;

const Accordion1 = styled(Accordion)`
  box-shadow: 2px 2px 10px #00000029;
  border-radius: 8px;
  opacity: 1;
`;

export default GenericAccordion;
