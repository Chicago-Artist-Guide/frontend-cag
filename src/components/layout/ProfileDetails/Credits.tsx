import React from 'react';
import styled from 'styled-components';
import { Col } from 'react-bootstrap';
//import Button from '../../../genericComponents/Button';

const Credits = (props: any) => {
  // const { text } = props;
  return (
    <TextBody>
      <>
        <h2>Credits</h2>
        <Credit>
          <Col lg={4}>
            <b>Come From Away</b> (1/5/2019 - 6/20/2019)
            <br />
            Pantages
            <br />
            Los Angeles, CA
          </Col>
          <Col lg={4}>
            <i>Tree #5</i>
            <br />
            <a href="www.somewebsite.com">A Theater Co</a>
            <br />
            Director: Jack Johnson
            <br />
            Musical Director: Jason Johnson
          </Col>
          <Col lg={4}>
            <b>Recognition</b>
            <br />
            Best Foliage
          </Col>
          <br />
        </Credit>
      </>
    </TextBody>
  );
};

const TextBody = styled.div`
  position: relative;
  padding: 20px;
`;

const Credit = styled.div`
  width: inherit;
  display: flex;
  flex-direction: row;
`;

export default Credits;
