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
  color: ${colors.dark};
  margin-right: 5px;
`;

const CAGButton = styled(BSButton)`
  border-radius: 25px;
  box-shadow: 2px 2px 20px rgba(0, 0, 0, 0.29);
  font-family: ${fonts.montserrat};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
  line-height: 16px;
  padding: 16px 24px;
  text-align: center;
  text-transform: uppercase;
  box-shadow: 0px 0px 8px 4px #0000000d;
  height: 40px;
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
