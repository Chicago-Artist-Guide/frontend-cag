import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Tagline, Title } from '../layout/Titles';

const Credits: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ADD YOUR PAST PERFORMANCES</Title>
          <Tagline>Where might we have seen you?</Tagline>
        </Col>
      </Row>
    </Container>
  );
};

export default Credits;
