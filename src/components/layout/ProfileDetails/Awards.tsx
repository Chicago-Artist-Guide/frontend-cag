import React from 'react';
import styled from 'styled-components';
import { Card as BSCard } from 'react-bootstrap';
//import Button from '../../../genericComponents/Button';

const Awards = (props: any) => {
  // const { text } = props;
  return (
    <TextBody>
      <>
        <h2>Awards and Recognitions</h2>
        <br />
        <Award>
          <h3>
            <b>Best Performance</b>
          </h3>
          <h4>Tree #5</h4>
        </Award>
      </>
    </TextBody>
  );
};

const TextBody = styled.div`
  position: relative;
  padding: 20px;
`;

const Award = styled(BSCard)`
  position: relative;
  right: 0.37%;
  bottom: 0.35%;
  border-radius: 8px;
  padding: 20px;
  background-color: #ffffff;
  blend-mode: pass-through;
  backdrop-filter: blur(15px);
  max-width: max-content;
  h3 {
    line-height: 26px;
    letter-spacing: 0.07em;
  }
`;

export default Awards;
