import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const ActorInfo1: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row>
        <Col lg="12">
          <h1>Let's Get Some Details</h1>
        </Col>
      </Row>
    </Container>
  );
};

export default ActorInfo1;
