import React from 'react';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';
import { fonts } from '../../theme/styleVars';
import InputField from '../../genericComponents/Input';
import Checkbox from '../../genericComponents/Checkbox';
import { Form } from 'react-bootstrap';

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

  console.log(formData);

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
          <p>
            Already a member? <Link to="/login">Log in here</Link>.
          </p>
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

export default Privacy;
