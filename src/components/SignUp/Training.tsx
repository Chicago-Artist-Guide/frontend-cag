import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Tagline, Title } from '../layout/Titles';

const Training: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ADD YOUR TRAINING DETAILS</Title>
          <Tagline>Tell us where you learned to do what you do.</Tagline>
        </Col>
      </Row>
    </Container>
  );
};

export default Training;
