import React from 'react';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';
import { colors, fonts } from '../../theme/styleVars';

const Checkbox = (props: any) => {
  const { fieldType, label, ...rest } = props;

  return (
    <CAGCheckbox>
      <Form.Check
        label={label}
        type={fieldType}
        {...rest}
        className="form-group"
      />
    </CAGCheckbox>
  );
};

const CAGCheckbox = styled(Form.Group)`
  label {
    font: ${fonts.mainFont} ${colors.mainFont};
    font-weight: 400;
  }
  checkbox {
    height: 25px;
    width: 25px;
  }
`;

export default Checkbox;
