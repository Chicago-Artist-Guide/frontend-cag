import React from 'react';
import styled from 'styled-components';
//import Button from '../../../genericComponents/Button';

const IntroText = (props: any) => {
  // const { text } = props;
  return (
    <TextBody>
      <>
        <p>
          <h1>John Johnson</h1>
          <Gender>He/Him</Gender>
        </p>
        <br />
        <Roles>Singer, Actor, Songwriter</Roles>
        {/* <Button>EDIT MODE: Edit Titles button</Button> */}
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus vitae
          quae veniam ea obcaecati commodi corporis vero labore laudantium
          ipsam. Autem, reiciendis at veniam hic voluptatem magnam cumque
          quaerat ipsa!
        </p>
      </>
    </TextBody>
  );
};

const TextBody = styled.div`
  position: relative;
  padding: 20px;
`;

const Gender = styled.h4`
  color: grey;
`;
const Roles = styled.h3`
  color: grey;
`;
export default IntroText;
