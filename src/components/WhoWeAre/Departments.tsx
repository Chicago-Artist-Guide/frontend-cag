import React from 'react';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';
import bios from './bios';
import Team from './Team';

const Department = () => {
  return (
    <AccordionSection className="container">
      <Accordion defaultActiveKey="0">
        <Accordion.Toggle className="accordionHeader row" eventKey="0">
          <h2>LEADERSHIP</h2>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <Row>
            {bios['board'].map(who => (
              <Col md={3}>
                <Team
                  image={who.image}
                  name={who.name}
                  pronoun={who.pronouns}
                />
              </Col>
            ))}
          </Row>
        </Accordion.Collapse>

        <Accordion.Toggle className="accordionHeader row" eventKey="1">
          <h2>BUSINESS OPERATIONS</h2>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="1">
          <Row>
            {bios['operations'].map(who => (
              <Col md={3}>
                <Team
                  image={who.image}
                  name={who.name}
                  pronoun={who.pronouns}
                />
              </Col>
            ))}
          </Row>
        </Accordion.Collapse>

        <Accordion.Toggle className="accordionHeader row" eventKey="2">
          <h2>DEVELOPMENT</h2>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="2">
          <Row>
            {bios['technical'].map(who => (
              <Col md={3}>
                <Team
                  image={who.image}
                  name={who.name}
                  pronoun={who.pronouns}
                />
              </Col>
            ))}
          </Row>
        </Accordion.Collapse>

        {console.log(bios['board'])}
        {console.log(bios['operations'])}
        {console.log(bios['technical'])}
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
