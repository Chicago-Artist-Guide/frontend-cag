import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Tagline, Title } from '../layout/Titles';

const Awards: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>ANY AWARDS OR RECOGNITION?</Title>
          <Tagline>Don't be shy, brag about it.</Tagline>
        </Col>
      </Row>
    </Container>
  );
};

export default Awards;
