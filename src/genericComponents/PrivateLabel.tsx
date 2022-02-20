import React from 'react';
import { Badge } from 'react-bootstrap';
import styled from 'styled-components';
import { colors, fonts } from '../theme/styleVars';

const PrivateLabel = (props: any) => {
  const { ...rest } = props;
  return <CAGPrivLabel {...rest}>private</CAGPrivLabel>;
};

const CAGPrivLabel = styled(Badge)`
  border-radius: 7px;
  font-family: ${fonts.montserrat};
  color: ${colors.secondaryFontColor};
  letter-spacing: 0.15rem;
  font-weight: lighter;
  padding: 8px 10px;
  text-transform: uppercase;
  background-color: ${colors.grayishLightGreen};
`;

export default PrivateLabel;
