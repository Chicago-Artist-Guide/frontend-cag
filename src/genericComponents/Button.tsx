import React from 'react';
import { Button } from 'react-bootstrap';
import styled from 'styled-components';

const ButtonPrimary = (props: any) => {
  const { onClick, text, variant } = props;

  // className={`${getVariantClassName(variant)}${className ? ' ' + className : ''}`}

  return (
    <CAGButton
      className={`CAGButton.${variant}-class`}
      onClick={onClick}
      variant={variant}
    >
      {text}
    </CAGButton>
  );
};

const CAGButton = styled(Button)`
  &.primary-class {
    width: 96px;
    height: 47px;
    character-spacing: 70;
    color: white;
    font-family: Montserrat;
    font-size: 12px;
    font-weight: bold;
    line-spacing: 15;
    transform: uppercase;
    border-radius: 25px;
    background: #82b29a 0% 0% no-repeat padding-box;
    box-shadow: 2px 2px 20px #00000029;
    opacity: 1;
  }
  ,
  &.secondary-class {
    width: 96px;
    height: 47px;
    character-spacing: 70;
    color: black;
    font-family: Montserrat;
    font-size: 12px;
    font-weight: bold;
    line-spacing: 15;
    transform: uppercase;
    border-radius: 25px;
    background: #ffffff 0% 0% no-repeat padding-box;
    box-shadow: 2px 2px 20px #00000029;
    opacity: 1;
  }
`;

export default ButtonPrimary;
