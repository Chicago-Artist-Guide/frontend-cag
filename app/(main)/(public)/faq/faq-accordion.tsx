'use client';

import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { type ReactNode, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import styled from 'styled-components';
import { colors } from '../../../../src/theme/styleVars';

export interface FaqSection {
  content: ReactNode;
  id: string;
  title: string;
}

interface FaqAccordionProps {
  sections: FaqSection[];
}

const FaqAccordion = ({ sections }: FaqAccordionProps) => {
  const [activeId, setActiveId] = useState(0);

  const toggleActive = (id: number) => {
    setActiveId(activeId === id ? -1 : id);
  };

  return (
    <AccordionSection className="container">
      {sections.map((section, index) => (
        <Accordion defaultActiveKey="0" key={section.id}>
          <Accordion.Item eventKey={index.toString()}>
            <Accordion.Button
              className="accordion-header row"
              onClick={() => toggleActive(index)}
            >
              <h2 className="section-text text-left">
                {section.title}
                <FontAwesomeIcon
                  className="bod-icon"
                  icon={activeId === index ? faAngleUp : faAngleDown}
                  pull="right"
                  size="lg"
                />
              </h2>
            </Accordion.Button>
            <Accordion.Body>{section.content}</Accordion.Body>
          </Accordion.Item>
          <HrLine />
        </Accordion>
      ))}
    </AccordionSection>
  );
};

const AccordionSection = styled.div`
  padding: 0;
  margin-top: 2rem;

  .accordion-header {
    border: none;
    background: none;
    padding: 0;
    margin: 0;

    h2 {
      font-size: 21px;
    }
  }

  .section-text {
    text-align: left;
  }

  .section-text:hover {
    color: ${colors.mint};
  }

  button:focus {
    outline: none;
  }
`;

const HrLine = styled.hr`
  border-width: 2px;
  border-color: ${colors.salmon};
  padding: 0;
  width: 100%;
`;

export default FaqAccordion;
