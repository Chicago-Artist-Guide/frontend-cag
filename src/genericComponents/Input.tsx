import React from 'react';
import { Form } from 'react-bootstrap';
import { colors, fonts } from '../theme/styleVars';
import styled from 'styled-components';

const InputField = (props: any) => {
  const { fieldType, label, name, onChange, placeholder, ...rest } = props;

  return (
    <CAGInput>
      <CAGLabel>{label}</CAGLabel>
      <Form.Control
        aria-label={label}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={fieldType}
        {...rest}
      />
    </CAGInput>
  );
};

const CAGInput = styled(Form.Group)`
  box-shadow: 0px 13px 21px -10px rgba(0, 0, 0, 0.3);
`;

const CAGLabel = styled(Form.Label)`
  color: ${colors.mainFont};
  font-family: ${fonts.mainFont};
  font-size: 20px;
`;

export default InputField;
