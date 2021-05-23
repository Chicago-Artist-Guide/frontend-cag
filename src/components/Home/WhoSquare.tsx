import React from 'react';
import styled from 'styled-components';
import SVGLayer from '../../components/SVGLayer';
import { colors } from '../../theme/styleVars';
import OffstageRoles from '../SignUp/OffstageRoles';

const WhoSquare = (props: any) => {
  const { blob, dancer, key, points: whoWeArray, title } = props;

  return (
    <div>
      <ShadowContainer key={key}>
        <SVGLayer blob={blob} dancer={dancer} />
        <ShadowTitle>{title}</ShadowTitle>
        <ul>
          {whoWeArray.map((who: any) => (
            <li key={who.id}>
              <p>{who.text}</p>
            </li>
          ))}
        </ul>
      </ShadowContainer>
      <OffstageRoles />
    </div>
  );
};

const ShadowContainer = styled.div`
  box-shadow: 2px 2px 10px rgba(0, 0, 29, 0.1);
  border-radius: 8px;
  background-color: ${colors.bodyBg};
  padding: 20px 40px 20px 40px;
  height: 100%;
`;

const ShadowTitle = styled.h3`
  margin: 0;
  padding: 0;
`;

export default WhoSquare;
