import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const OffstageRoles: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row>
        <Col lg="12">
          <h1>So, What Do You Like Doing?</h1>
          <h2>Tell us what positions suit you best</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default OffstageRoles;
