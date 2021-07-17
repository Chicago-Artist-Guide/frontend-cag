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
      return <CaretUpFill />;
    } else {
      return <CaretDownFill />;
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
`;

const Accordion1 = styled(Accordion)`
  box-shadow: 10px 10px;
`;

export default GenericAccordion;
