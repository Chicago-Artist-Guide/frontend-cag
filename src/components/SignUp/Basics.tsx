import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Form } from 'react-bootstrap';
import InputField from '../../genericComponents/Input';
import Checkbox from '../../genericComponents/Checkbox';
import { colors, fonts } from '../../theme/styleVars';

const Privacy: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { setForm, formData } = props;
  const {
    basicsFirstName,
    basicsLastName,
    basicsEmailAddress,
    basicsPassword,
    basics18Plus
  } = formData;

  return (
    <Container>
      <Row>
        <Title>LET'S GET TO KNOW EACH OTHER</Title>
        <Col lg="4">
          <Form>
            <InputField
              label="First"
              name="basicsFirstName"
              onChange={setForm}
              value={basicsFirstName || ''}
            />
            <InputField
              label="Last"
              name="basicsLastName"
              onChange={setForm}
              value={basicsLastName || ''}
            />
            <InputField
              label="Email Address"
              name="basicsEmailAddress"
              onChange={setForm}
              value={basicsEmailAddress || ''}
            />
            <InputField
              fieldType="password"
              label="Password"
              name="basicsPassword"
              onChange={setForm}
              value={basicsPassword || ''}
            />
            <Checkbox
              checked={basics18Plus || false}
              fieldType="checkbox"
              label="18 years or older"
              name="basics18Plus"
              onChange={setForm}
            />
          </Form>
          <LoginLink>
            Already a member? <Link to="/login">Log in here</Link>
          </LoginLink>
        </Col>
        <Col lg="4"></Col>
        <Col lg="4"></Col>
      </Row>
    </Container>
  );
};

const Title = styled.h1`
  font: ${fonts.montserrat} 48px bold;
  padding: 48px 0px;
`;

const LoginLink = styled.p`
  text-align: left;
  font-size: 14px/18px;
  font-style: italic;
  letter-spacing: 0.14px;
  margin-top: 40px;

  a {
    color: ${colors.orange};
  }
`;

export default Privacy;
