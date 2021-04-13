import React from 'react';
import { FormControl, FormLabel, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';
// import { colors, fonts } from '../theme/styleVars';

const InputField = (props: any) => {
  const { formType, label, name, onChange, placeholder } = props;

  return (
    <CAGInput>
      <InputGroup>
        <FormLabel>{label}</FormLabel>
        <FormControl
          aria-label={label}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={formType}
        />
      </InputGroup>
    </CAGInput>
  );
};

const CAGInput = styled(InputGroup)`
  background: white 0% 0% no-repeat padding-box;
  border-radius: 6px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 1a);
`;

export default InputField;
