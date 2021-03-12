import React from 'react';
import styled from 'styled-components';
//import Row from 'react-bootstrap/Row';
//import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';

import Bios from './Bios';

const Department = () => {
  return (
    <AccordionSection className="container">
      <Accordion defaultActiveKey="0">
        <Accordion.Toggle className="accordionHeader row" eventKey="0">
          <h2>test</h2>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <p>SOME Text</p>
        </Accordion.Collapse>

        <Accordion.Toggle className="accordionHeader row" eventKey="1">
          <h2>ADVISORY BOARD</h2>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="1">
          <p>SOME Text</p>
        </Accordion.Collapse>

        {console.log(Bios)}
      </Accordion>
    </AccordionSection>
  );
};

const AccordionSection = styled.div`
  margin-top: 2em;
  .accordionHeader {
    border: none;
    background: none;
    padding: 0;
  }
`;
export default Department;
