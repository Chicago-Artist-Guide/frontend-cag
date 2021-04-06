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
          <h2>BOARD OF DIRECTORS</h2>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <Row>
            {bios['board'].map(who => (
              <Col lg={4} md={6} sm={8}>
                <Team
                  bio={who.bio}
                  image={who.image}
                  key={who.key}
                  linkedin={who.linkedin}
                  name={who.name}
                  pronoun={who.pronouns}
                  role={who.role}
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
              <Col lg={4} md={6} sm={8}>
                <Team
                  bio={who.bio}
                  image={who.image}
                  key={who.key}
                  linkedin={who.linkedin}
                  name={who.name}
                  pronoun={who.pronouns}
                  role={who.role}
                />
              </Col>
            ))}
          </Row>
        </Accordion.Collapse>

        <Accordion.Toggle className="accordionHeader row" eventKey="2">
          <h2>SITE DEVELOPMENT TEAM</h2>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="2">
          <Row>
            {bios['technical'].map(who => (
              <Col lg={4} md={6} sm={8}>
                <Team
                  bio={who.bio}
                  image={who.image}
                  key={who.key}
                  linkedin={who.linkedin}
                  name={who.name}
                  pronoun={who.pronouns}
                  role={who.role}
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
