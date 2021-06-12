import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Demographics: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row>
        <Col lg="12">
          <h1>Almost Done!</h1>
          <h2>Just a few more questions.</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default Demographics;
