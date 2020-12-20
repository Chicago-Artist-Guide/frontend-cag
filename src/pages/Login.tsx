import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import PageContainer from '../components/layout/PageContainer';
import { Title } from '../components/layout/Titles';
import Red_Blob from '../images/red_blob.svg';

const Login = () => (
  <PageContainer>
    <Row>
      <Col lg={5}>
        <Title>WELCOME BACK</Title>
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
            <p>Not a member yet? <a className="orangeText" href="/sign-up">Join Us</a></p>
          </Form.Text>
          <Button variant="primary" href="/" type="submit">
            LOG IN
          </Button>
        </Form>
      </Col>
      <Col lg={2} />
      <Col lg={5}>
        <img alt="Chicago Artist Guide" src={Red_Blob} />
      </Col>
    </Row>
  </PageContainer>
);

export default Login;
