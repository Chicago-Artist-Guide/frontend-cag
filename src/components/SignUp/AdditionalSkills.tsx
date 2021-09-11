import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Tagline, Title } from '../layout/Titles';

const AdditionalSkills: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ANY SPECIAL SKILLS?</Title>
          <Tagline>Tell us more about what you can do.</Tagline>
        </Col>
      </Row>
    </Container>
  );
};

export default AdditionalSkills;
