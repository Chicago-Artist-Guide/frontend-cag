import React from 'react';
import { FormControl, InputGroup } from 'react-bootstrap';
import styled from 'styled-components';

const InputField = (props: any) => {
  const { placeholder } = props;

  return (
    <CAGInput>
      <InputGroup className="mb-3">
        <FormControl
          aria-describedby="basic-addon1"
          aria-label="Username"
          placeholder={placeholder}
        />
      </InputGroup>
    </CAGInput>
  );
};

const CAGInput = styled(InputGroup)`
  width: 279px;
  height: 32px;
  background: var(--unnamed-color-ffffff) 0% 0% no-repeat padding-box;
  background: #ffffff 0% 0% no-repeat padding-box;
  box-shadow: 2px 2px 10px #0000001a;
  border-radius: 6px;
  opacity: 1;
`;

export default InputField;
