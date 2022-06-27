import React from "react";
import styled from "styled-components";
import { Col, Row } from "react-bootstrap";
import { CFA } from "../../../images";
//import Button from '../../../genericComponents/Button';

const UpcomingPerformances = (props: any) => {
  // const { text } = props;
  return (
    <TextBody>
      <>
        <h2>Upcoming Performances</h2>
        <Row>
          <Col lg={3}>
            <Poster>
              <img alt="Come From Away poster" src={CFA} />
            </Poster>
          </Col>
          <Col lg={9}>
            <h3>Come From Away</h3>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempora
              laboriosam vel blanditiis ex, voluptate nisi repudiandae ut nobis
              sint, animi assumenda, autem reprehenderit quaerat suscipit
              recusandae hic labore eligendi doloribus.
            </p>
            <h5>Industry Code: CODE123HERE</h5>
            <h5>
              Website:
              <a href="www.somewebsite.com/CFA">
                A Theater Co. Presents 'Come From Away'
              </a>
            </h5>
          </Col>
        </Row>
      </>
    </TextBody>
  );
};

const TextBody = styled.div`
  position: relative;
  padding: 20px;
`;

const Poster = styled.div`
  width: inherit;
  img {
    width: inherit;
  }
`;

export default UpcomingPerformances;
