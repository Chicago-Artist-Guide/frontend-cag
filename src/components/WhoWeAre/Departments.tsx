import React, { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Masonry from 'react-masonry-css';
import styled from 'styled-components';
import { media } from 'styled-bootstrap-grid';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { colors } from '../../theme/styleVars';
import bios from './bios';
import Team from './Team';

const Department = () => {
  const sectionTitles = {
    board: 'BOARD OF DIRECTORS',
    artists: 'ARTIST ADVISORY BOARD',
    operations: 'BUSINESS OPERATIONS',
    technical: 'SITE DEVELOPMENT TEAM'
  };

  const sections = Object.keys(bios).map(s => ({
    title: (sectionTitles as any)[s],
    bios: (bios as any)[s]
  }));

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 2,
    500: 1
  };

  const [activeID, setActiveID] = useState(0);

  const toggleActive = (id: any) => {
    setActiveID(activeID === id ? -1 : id);
  };

  return (
    <AccordionSection className="container">
      {sections.map((sect, index) => (
        <Accordion defaultActiveKey="0" key={index}>
          <Accordion.Toggle
            className="accordion-header row"
            eventKey={index.toString()}
            onClick={() => toggleActive(index)}
          >
            <h2 className="section-text">
              {sect.title}
              <FontAwesomeIcon
                className="bod-icon"
                icon={activeID === index ? faAngleUp : faAngleDown}
                pull="right"
                size="lg"
              />
            </h2>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey={index.toString()}>
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              {sect.bios.map((who: any) => (
                <Team {...who} />
              ))}
            </Masonry>
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

  .accordion-header {
    border: none;
    background: none;
    padding: 0;
    margin: 0;
  }

  .section-text {
    ${media.smaller`
      text-align: left;
    `}
  }

  .section-text:hover {
    color: ${colors.darkGreen};
  }

  button: focus {
    outline: none;
  }

  .my-masonry-grid {
    display: flex;
    margin-left: -30px;
    width: auto;
  }

  .my-masonry-grid_column {
    background-clip: padding-box;
    padding-left: 30px;

    > div {
      margin-bottom: 30px;
    }
  }
`;

const HrLine = styled.hr`
  border-width: 2px;
  border-color: ${colors.orange};
  padding: 0;
  width: 100%;
`;
export default Department;
