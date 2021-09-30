import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { Tagline, Title } from '../layout/Titles';
import CountrySelect from 'react-bootstrap-country-select';

const [value, setValue] = useState(null);

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
          <Form.Group controlId="formInstitution">
            <Form.Label>Institution</Form.Label>
            <Form.Control type="institution" />
          </Form.Group>
          <Tagline>Location</Tagline>
          <CountrySelect onChange={setValue} value={value} />
          <Form.Group controlId="formCity">
            <Form.Label>City</Form.Label>
            <Form.Control type="city" />
          </Form.Group>
          <Form.Group controlId="formDegree">
            <Form.Label>Degree</Form.Label>
            <Form.Control type="degree" />
          </Form.Group>
          <Tagline>Notes/Details</Tagline>
          <Form.Group>
            <Form.Label>Tell us about your training</Form.Label>
            <Form.Control aria-label="With textarea" as="textarea" />
          </Form.Group>
        </Col>
      </Row>
    </Container>
  );
};

export default Training;
