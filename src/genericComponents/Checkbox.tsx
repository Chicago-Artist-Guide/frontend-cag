import React, { useState } from 'react';
import { InputGroup } from 'react-bootstrap';
import styled from 'styled-components';

const Checkbox = (props: any) => {
  const [clicked, setClicked] = useState(false);

  return <CAGCheckbox onClick={() => setClicked(!clicked)}></CAGCheckbox>;
};

const CAGCheckbox = styled(InputGroup.Checkbox)`
  background: var(--unnamed-color-ffffff) 0% 0% no-repeat padding-box;
  background: #ffffff 0% 0% no-repeat padding-box;
  box-shadow: 2px 2px 10px #0000001a;
  border-radius: 6px;
  opacity: 1;
  width: 24px;
  height: 24px;
`;

export default Checkbox;
