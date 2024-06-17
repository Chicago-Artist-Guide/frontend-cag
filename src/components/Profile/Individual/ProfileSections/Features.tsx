import React from 'react';
import Image from 'react-bootstrap';
import styled from 'styled-components';
import { colors } from '../../../../theme/styleVars';
import { Col, Row, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

const Features: React.FC<{
  features: any;
  emptyPlaceholder: string;
}> = ({ features }) => {
  const director = ' Cody Maverick';
  const musicalDirector = 'Jeff Bridges';
  const group = 'The Company';
  return (
    <Container>
      {features.map((feature: any) => (
        <div>
          <FeatureTitle>
            <Bold>
              {feature.title} <Group> - {group}</Group>
            </Bold>
            <Bold>{feature.year}</Bold>
          </FeatureTitle>
          <FeatureInformation>
            <Role>{feature.role}</Role>
            <p>Director: {director}</p>
            <p>Musical Director: {musicalDirector}</p>
          </FeatureInformation>
          <hr />
        </div>
      ))}
    </Container>
  );
};

const FeatureTitle = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-top: 25px;
`;

const FeatureInformation = styled.div`
  padding: 0px 25px 0px;
  line-height: 1.5;
`;

const Bold = styled.p`
  font-weight: bolder;
  font-size: 20px;
`;
const Group = styled.span`
  font-style: italic;
  font-weight: normal;
  font-size: 18px;
`;

const Role = styled.p`
  font-weight: 600;
`;

export default Features;
