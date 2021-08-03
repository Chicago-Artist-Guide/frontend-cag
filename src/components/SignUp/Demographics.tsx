import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Tagline, Title } from '../layout/Titles';

const Demographics: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ALMOST DONE!</Title>
          <Tagline>Just a few more questions.</Tagline>
        </Col>
      </Row>
    </Container>
  );
};

export default Demographics;
