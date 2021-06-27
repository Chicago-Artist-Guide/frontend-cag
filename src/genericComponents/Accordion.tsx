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
    <Accordion defaultActiveKey="0" onClick={() => setIsOpen(!isOpen)}>
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
    </Accordion>
  );
};

const CardHeader = styled(Card.Header)`
  display: flex;
  justify-content: space-between;
`;

export default GenericAccordion;
