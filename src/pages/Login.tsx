import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Red_Blob from '../images/red_blob.svg';

const Login = () => (
  <Container className="margin-container">
    <Row>
      <Col lg={5}>
        <h1 className="title margin_button_login">WELCOME BACK</h1>
        <Form className="margin-team">
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" />
          </Form.Group>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" />
          </Form.Group>
          <Form.Text className="text-muted">
            <p>Not a member yet? <a href="/sign-up" id="email">Join Us</a></p>
          </Form.Text>
          <Button variant="primary" href="/" type="submit">
            LOG IN
          </Button>
        </Form>
      </Col>
      <Col lg={2} />
      <Col lg={5}>
        <img src={Red_Blob} alt="Chicago Artist Guide" />
      </Col>
    </Row>
  </Container>
);

export default Login;
