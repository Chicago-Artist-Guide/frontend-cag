import React from 'react';
import { Badge as PrivateLabel } from 'react-bootstrap';
import styled from 'styled-components';
import { colors, fonts } from '../theme/styleVars';

const Badge = () => {
  return <CAGLabel>private</CAGLabel>;
};

const CAGLabel = styled(PrivateLabel)`
  border-radius: 7px;
  font-family: ${fonts.montserrat};
  color: ${colors.secondaryFontColor};
  letter-spacing: 0.15rem;
  font-weight: lighter;
  padding: 8px 10px;
  text-transform: uppercase;
  background-color: #b8d8c7;
`;

export default Badge;
