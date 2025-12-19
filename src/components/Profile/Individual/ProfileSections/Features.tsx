import React from 'react';
import { Container } from 'react-bootstrap';
import styled from 'styled-components';

const Features: React.FC<{
  features: any;
  emptyPlaceholder: string;
}> = ({ features }) => {
  return (
    <Container>
      {features.map((feature: any) => (
        <div key={feature.id || feature.title}>
          <FeatureTitle>
            <Bold>
              {feature.title} <Group> - {feature.group}</Group>
            </Bold>
            <Bold>{feature.year}</Bold>
          </FeatureTitle>
          <FeatureInformation>
            <Role>{feature.role}</Role>
            {feature.director && <p>Director: {feature.director}</p>}
            {feature.musicalDirector && (
              <p>Musical Director: {feature.musicalDirector}</p>
            )}
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
