import React from 'react';
import { InputGroup } from 'react-bootstrap';
import styled from 'styled-components';
// import { colors, fonts } from '../theme/styleVars';

const RadioButton = (props: any) => {
  return <CAGRadioButton {...props}></CAGRadioButton>;
};

const CAGRadioButton = styled(InputGroup.Radio)`
  border: 1.5px solid #4d5055;
  border: 2px solid #707070;
  border-radius: 12px;
`;

export default RadioButton;
