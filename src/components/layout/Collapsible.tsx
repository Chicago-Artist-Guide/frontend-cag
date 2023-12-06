import React, { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Masonry from 'react-masonry-css';
import styled from 'styled-components';
import { media } from 'styled-bootstrap-grid';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { colors } from '../../theme/styleVars';

interface Props {
  sectionTitles: any;
  subSections: any;
  subContainer: any;
  grid: boolean;
}

const Collapsible: React.FC<Props> = ({
  sectionTitles,
  subSections,
  subContainer,
  grid
}) => {
  const sections = Object.keys(subSections).map((s) => ({
    title: (sectionTitles as any)[s],
    subSections: (subSections as any)[s]
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
          <Accordion.Item eventKey={index.toString()}>
            <Accordion.Button
              className="accordion-header row"
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
            </Accordion.Button>
            <Accordion.Body>
              {grid ? (
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="my-masonry-grid"
                  columnClassName="my-masonry-grid_column"
                >
                  {sect.subSections.map((sub: any) => subContainer(sub))}
                </Masonry>
              ) : (
                <>{sect.subSections.map((sub: any) => subContainer(sub))}</>
              )}
            </Accordion.Body>
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

export default Collapsible;
