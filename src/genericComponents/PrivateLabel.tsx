import React from 'react';
import { Badge } from 'react-bootstrap';
import styled from 'styled-components';
import { colors, fonts } from '../theme/styleVars';

const PrivateLabel = (props: any) => {
  const { size, ...rest } = props;
  return (
    <CAGLabel className={`${size}-size`} size={size} {...rest}>
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
  background-color: ${colors.grayishLightGreen};

  &.small-size {
    font-size: 60%;
    padding: 9.5px 16.48px;
  }
`;

export default PrivateLabel;
