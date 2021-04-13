import React from 'react';
import { Col, Form } from 'react-bootstrap';
// import { colors, fonts } from '../theme/styleVars';

const DropdownMenu = (props: any) => {
  const {
    defaultFormValue,
    controlId,
    label,
    onChange,
    selectedValue,
    values
  } = props;
  return (
    <Form.Group as={Col} controlId={controlId}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        as="select"
        defaultValue={defaultFormValue}
        onChange={onChange}
      >
        {values.map((value: string) => (
          <option selected={value === selectedValue} value={value}>
            {value}
          </option>
        ))}
      </Form.Control>
    </Form.Group>
  );
};

export default DropdownMenu;
