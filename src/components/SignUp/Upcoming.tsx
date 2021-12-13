import React from 'react';
import Container from 'react-bootstrap/Container';
import { Col, Form, Row } from 'react-bootstrap';
import { Tagline, Title } from '../layout/Titles';

const Upcoming: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row lg="12">
        <Col>
          <Title>GOT AN UPCOMING FEATURE?</Title>
          <Tagline>Promote your next performance!</Tagline>
        </Col>
      </Row>
      <Row lg="3">
        <Col>
          <Form.Text>Save and add another upcoming feature</Form.Text>
        </Col>
        <Form>
          <Form.Group controlId="show-title">
            <Form.Control placeholder="Show Title" type="text" />
          </Form.Group>

          <Form.Group controlId="show-synopsis">
            <Form.Control as="textarea" placeholder="Show synopsis" />
          </Form.Group>
          <Form.Group controlId="industry-code">
            <Form.Control placeholder="Industry code" type="text" />
          </Form.Group>
          <Form.Group controlId="link-to-site-tickets">
            <Form.Control placeholder="Link to Website/Tickets" type="text" />
          </Form.Group>
        </Form>
      </Row>
    </Container>
  );
};

export default Upcoming;
