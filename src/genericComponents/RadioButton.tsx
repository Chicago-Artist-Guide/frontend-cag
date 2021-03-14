import React from 'react';
import { InputGroup } from 'react-bootstrap';
import styled from 'styled-components';

const RadioButton = (props: any) => {
  const { onClick } = props;

  return <CAGRadioButton onClick={onClick}></CAGRadioButton>;
};

const CAGRadioButton = styled(InputGroup.Radio)`
  border: 1.5px solid var(---4d5055);
  border: 2px solid #707070;
  border-radius: 12px;
  opacity: 1;
  width: 16px;
  height: 16px;
`;

export default RadioButton;
