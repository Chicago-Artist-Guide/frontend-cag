import React from 'react';
import { InputGroup } from 'react-bootstrap';
import styled from 'styled-components';

const Checkbox = (props: any) => {
  return <CAGCheckbox />;
};

const CAGCheckbox = styled(InputGroup.Checkbox)`
  background: white 0% 0% no-repeat padding-box;
  border-radius: 6px;
  box-shadow: 2px 2px 10px black;
`;

export default Checkbox;
