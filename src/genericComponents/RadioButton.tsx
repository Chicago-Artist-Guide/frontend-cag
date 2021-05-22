import React from 'react';
import { InputGroup } from 'react-bootstrap';
import styled from 'styled-components';
import { colors } from '../theme/styleVars';

const RadioButton = (props: any) => {
  return <CAGRadioButton {...props}></CAGRadioButton>;
};

const CAGRadioButton = styled(InputGroup.Radio)`
  border: 1.5px solid ${colors.gray};
  border-radius: 12px;
`;

export default RadioButton;
