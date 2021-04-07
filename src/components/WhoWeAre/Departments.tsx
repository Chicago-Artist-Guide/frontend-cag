import React, { useState } from 'react';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';
import bios from './bios';
import Team from './Team';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { colors } from '../../theme/styleVars';

const sections = [bios['board'], bios['operations'], bios['technical']];

const Department = () => {
  const [activeID, setActiveID] = useState(0);
  function toggleActive(id: any) {
    if (activeID === id) {
      setActiveID(-1);
    } else {
      setActiveID(id);
    }
  }

  return (
    <AccordionSection className="container">
      {sections.map((sect, index) => (
        <Accordion defaultActiveKey="0" key={index}>
          <Accordion.Toggle
            className="accordionHeader row"
            eventKey={index.toString()}
            onClick={() => toggleActive(index)}
          >
            <h2 className="sectionText">
              {index === 0
                ? 'BOARD OF DIRECTORS'
                : index === 1
                ? 'BUSINESS OPERATIONS'
                : 'SITE DEVELOPMENT TEAM'}
              <FontAwesomeIcon
                icon={activeID === index ? faAngleUp : faAngleDown}
                pull="right"
                size="lg"
              />
            </h2>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey={index.toString()}>
            <Row>
              {sect.map(who => (
                <Col key={who.id} lg={4} md={6} sm={8}>
                  <Team
                    bio={who.bio}
                    id={who.id}
                    image={who.image}
                    linkedin={who.linkedin}
                    name={who.name}
                    pronoun={who.pronouns}
                    role={who.role}
                  />
                </Col>
              ))}
            </Row>
          </Accordion.Collapse>
          <HrLine />
        </Accordion>
      ))}
    </AccordionSection>
  );
};

const AccordionSection = styled.div`
  padding: 0;
  margin-top: 1rem;
  .accordionHeader {
    border: none;
    background: none;
    padding: 0;
    margin: 0;
  }
  .sectiontext: hover {
    color: ${colors.darkGreen};
  }
  button: focus {
    outline: none;
  }
`;

const HrLine = styled.hr`
  border-width: 2px;
  border-color: ${colors.orange};
  padding: 0;
  width: 100%;
`;
export default Department;
