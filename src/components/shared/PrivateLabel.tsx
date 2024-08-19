import React from 'react';
import { Badge } from 'react-bootstrap';
import styled from 'styled-components';
import { colors, fonts } from '../../theme/styleVars';

const PrivateLabel = () => {
  return (
    <CAGLabel as="span" className="badge">
      private
    </CAGLabel>
  );
};

const CAGLabel = styled(Badge)`
  border-radius: 7px;
  font-family: ${fonts.montserrat};
  color: ${colors.secondaryFontColor};
  letter-spacing: 0.15rem;
  font-weight: lighter;
  padding: 8px 10px;
  text-transform: uppercase;
  background-color: ${colors.yoda};
`;

export default PrivateLabel;
