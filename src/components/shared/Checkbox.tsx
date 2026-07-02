import React from 'react';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';
import { colors, fonts } from '../../theme/styleVars';

const Checkbox = (props: any) => {
  const { fieldType, label, id, ...rest } = props;
  // Form.Check only links the label to the input (via htmlFor/id) when an
  // id is supplied — without one, screen readers and label-based test
  // queries can't associate the two. Generate a stable fallback so every
  // Checkbox is accessible even when callers don't pass their own id.
  const generatedId = React.useId();

  return (
    <CAGCheckbox>
      <Form.Check
        id={id || generatedId}
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
