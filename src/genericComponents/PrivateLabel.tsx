import React from 'react';
import { Badge as PrivateLabel } from 'react-bootstrap';
import styled from 'styled-components';
import { colors, fonts } from '../theme/styleVars';

const Badge = () => {
  return <CAGLabel>private</CAGLabel>;
};

/* background color based on hex code color picker figma 
-- can change to ${colors.primary} or add as a new color 
in theme/styleVars.ts*/

const CAGLabel = styled(PrivateLabel)`
  border-radius: 7px;
  font-family: ${fonts.montserrat};
  color: ${colors.mainFont};
  letter-spacing: 0.2rem;
  padding: 8px 10px;
  text-transform: uppercase;
  background-color: #b9d9c2;
`;

export default Badge;
