import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button as BSButton } from 'react-bootstrap';
import styled from 'styled-components';
import { colors, fonts } from '../theme/styleVars';

const Button = (props: any) => {
  const { onClick, text, variant, icon, ...rest } = props;

  return (
    <CAGButton
      className={`${variant}-class d-flex align-items-center`}
      onClick={onClick}
      variant={variant}
      {...rest}
    >
      {icon && <Icon icon={icon} />}
      {text}
    </CAGButton>
  );
};

const Icon = styled(FontAwesomeIcon)`
  margin-right: 5px;
`;

const CAGButton = styled(BSButton)`
  border-radius: 20px;
  box-shadow: 0px 0px 8px 4px #0000000d;
  font-family: ${fonts.montserrat};
  font-size: 14px;
  font-weight: 700;
  height: 40px;
  letter-spacing: 0.1em;
  line-height: 16px;
  padding: 12px 18px;
  text-align: center;
  text-transform: uppercase;

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

  &.danger-class {
    background: ${colors.salmon};
    border-color: ${colors.salmon};
  }
`;

export default Button;
