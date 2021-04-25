import React from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';
import { colors, fonts } from '../theme/styleVars';

const ButtonPrimary = (props: any) => {
  const { onClick, text, variant, ...rest } = props;

  return (
    <CAGButton
      className={`${variant}-class`}
      onClick={onClick}
      rest={...rest}
      variant={variant}
    >
      {text}
    </CAGButton>
  );
};

const CAGButton = styled(Button)`
  border-radius: 25px;
  box-shadow: 2px 2px 20px rgba(0, 0, 0, 0.29);
  character-spacing: 70;
  font-family: ${fonts.montserrat};
  font-size: 12px;
  font-weight: bold;
  line-spacing: 15;
  transform: uppercase;

  &.primary-class {
    background: ${colors.primary};
    color: white;
  }

  &.secondary-class {
    background: #ffffff;
    color: white;
  }
`;

export default ButtonPrimary;
