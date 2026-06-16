import React from 'react';
import { Container } from 'react-bootstrap';
import styled from 'styled-components';

const Features: React.FC<
  React.PropsWithChildren<{
    features: any;
    emptyPlaceholder: string;
  }>
> = ({ features }) => {
  return (
    <Container>
      {features.map((feature: any) => (
        <div key={feature.id || feature.title}>
          <div className="mt-[25px] flex justify-between font-bold">
            <Bold>
              {feature.title}{' '}
              <span className="text-[18px] font-normal italic">
                {' '}
                - {feature.group}
              </span>
            </Bold>
            <Bold>{feature.year}</Bold>
          </div>
          <div className="px-[25px] pb-0 pt-0 leading-[1.5]">
            <p className="font-semibold">{feature.role}</p>
            {feature.director && <p>Director: {feature.director}</p>}
            {feature.musicalDirector && (
              <p>Musical Director: {feature.musicalDirector}</p>
            )}
          </div>
          <hr />
        </div>
      ))}
    </Container>
  );
};
const Bold = styled.p`
  font-weight: bolder;
  font-size: 20px;
`;
export default Features;
