import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import styled from 'styled-components';

const GenericAccordion = (props: any) => {
  const { children, textHeader, eventKey } = props;

  return (
    <CardHolder>
      <Accordion.Item eventKey={eventKey || '0'}>
        <CardHeader>
          {textHeader}
          <Accordion.Button as={Button} variant="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
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
  align-items: center;
`;

export default GenericAccordion;
