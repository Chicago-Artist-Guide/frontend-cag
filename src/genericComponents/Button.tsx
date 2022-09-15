import React from 'react';
import { Button as BSButton } from 'react-bootstrap';
import styled from 'styled-components';
import { colors, fonts } from '../theme/styleVars';

const Button = (props: any) => {
  const { onClick, text, variant, ...rest } = props;

  return (
    <>
      <CAGButton
        className={`${variant}-class`}
        onClick={onClick}
        variant={variant}
        {...rest}
      >
        {text}
      </CAGButton>
    </>
  );
};

const CAGButton = styled(BSButton)`
  border-radius: 25px;
  box-shadow: 2px 2px 20px rgba(0, 0, 0, 0.29);
  font-family: ${fonts.montserrat};
  text-transform: uppercase;
  box-shadow: 0px 0px 8px 4px #0000000d;
  height: 40px;
  left: 754px;
  top: 383.0390625px;
  border-radius: 20px;
  padding: 12px 18px 12px 18px;
  font-size: 14px;
  font-weight: 700;
  line-height: 16px;
  letter-spacing: 0.1em;
  text-align: center;

  &.primary-class {
    background: ${colors.primary};
    border-color: ${colors.primary};
    color: white;
  }

  &.primary-class:not(:disabled):not(.disabled):active {
    background: ${colors.darkPrimary};
    border-color: ${colors.darkPrimary};
  }

  &.secondary-class {
    background: white;
    border-color: white;
    color: ${colors.darkGrey};
  }
`;

export default Button;
