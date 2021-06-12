import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const ProfilePhoto: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row>
        <Col lg="12">
          <h1>Let's Put A Face to the Name</h1>
          <h2>We just need one for now, but you can add more later.</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePhoto;
