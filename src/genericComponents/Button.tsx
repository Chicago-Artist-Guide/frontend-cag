import React from "react";
import { Button as BSButton } from "react-bootstrap";
import styled from "styled-components";
import { colors, fonts } from "../theme/styleVars";

const Button = (props: any) => {
  const { onClick, text, variant, ...rest } = props;

  return (
    <CAGButton
      className={`${variant}-class`}
      onClick={onClick}
      variant={variant}
      {...rest}
    >
      {text}
    </CAGButton>
  );
};

const CAGButton = styled(BSButton)`
  border-radius: 25px;
  box-shadow: 2px 2px 20px rgba(0, 0, 0, 0.1);
  font-family: ${fonts.montserrat};
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 70;
  line-spacing: 15;
  padding: 16px 24px;
  text-transform: uppercase;
  text-align: center;
  background: rgba(0, 0, 0, 0);
  border: rgba(0, 0, 0, 0);
  color: ${colors.slate};

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
