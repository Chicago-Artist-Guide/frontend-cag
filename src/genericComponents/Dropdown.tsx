import React from 'react';
import { Col, Form } from 'react-bootstrap';

const DropdownMenu = (props: any) => {
  const { onChange, values } = props;
  //do mapping that returns options
  return (
    <Form.Group as={Col} controlId="formGridState">
      <Form.Label>Select</Form.Label>
      <Form.Control as="select" defaultValue="Choose..." onChange={onChange}>
        {values.map((value: string) => {
          return <option>{value}</option>;
        })}
      </Form.Control>
    </Form.Group>
  );
};

export default DropdownMenu;
