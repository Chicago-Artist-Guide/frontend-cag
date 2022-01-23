import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Form } from 'react-bootstrap';
import { Title } from '../layout/Titles';
import InputField from '../../genericComponents/Input';
import Checkbox from '../../genericComponents/Checkbox';
import { colors } from '../../theme/styleVars';

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
    basicsPasswordConfirm,
    basics18Plus
  } = formData;

  const passwordErrors = () => {
    let passwordError = '';

    if (basicsPassword === '') passwordError = '';
    else if (basicsPassword !== basicsPasswordConfirm) {
      passwordError = 'Passwords must match';
    } else if (basicsPassword.length < 8) {
      passwordError = 'Password must be at least 8 characters';
    } else if (
      !basicsPassword.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)
    ) {
      passwordError =
        'Passwords must contain at least one uppercase letter, number, and special character';
    }
    return passwordError;
  };

  const firstNameError = () => {
    if (basicsFirstName === '') {
      return 'first name is required';
    }
  };

  const lastNameError = () => {
    if (basicsLastName === '') {
      return 'last name is required';
    }
  };

  const emailAddressError = () => {
    let emailAddressError = '';

    if (basicsEmailAddress === '') {
      emailAddressError = 'email required';
    } else if (
      // eslint-disable-next-line
      !basicsEmailAddress.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
    ) {
      emailAddressError = 'not valid email format';
    }

    return emailAddressError;
  };

  const check18PlusError = () => {
    if (basics18Plus === false) {
      return 'Need to verify over 18';
    }
  };

  return (
    <Container>
      <Row>
        <PaddingTitle>LET'S GET TO KNOW EACH OTHER</PaddingTitle>
        <Col lg="4">
          <Form>
            <InputField
              label="First"
              name="basicsFirstName"
              onChange={setForm}
              value={basicsFirstName || ''}
            />
            <span style={{ color: 'red', fontSize: '12px' }}>
              {firstNameError()}
            </span>
            <InputField
              label="Last"
              name="basicsLastName"
              onChange={setForm}
              value={basicsLastName || ''}
            />
            <span style={{ color: 'red', fontSize: '12px' }}>
              {lastNameError()}
            </span>
            <InputField
              label="Email Address"
              name="basicsEmailAddress"
              onChange={setForm}
              value={basicsEmailAddress || ''}
            />
            <span style={{ color: 'red', fontSize: '12px' }}>
              {emailAddressError()}
            </span>
            <InputField
              fieldType="password"
              label="Password"
              name="basicsPassword"
              onChange={setForm}
              value={basicsPassword || ''}
            />
            <PasswordReq>
              Minimum 8 characters, one uppercase, one lowercase, a number and
              special character.
            </PasswordReq>
            <InputField
              fieldType="password"
              label="Confirm Password"
              name="basicsPasswordConfirm"
              onChange={setForm}
              value={basicsPasswordConfirm || ''}
            />
            <span style={{ color: 'red', fontSize: '12px' }}>
              {passwordErrors()}
            </span>
            <Checkbox
              checked={basics18Plus || false}
              fieldType="checkbox"
              label="I confirm that I am at least 18 years of age or older"
              name="basics18Plus"
              onChange={setForm}
            />
            <span style={{ color: 'red', fontSize: '12px' }}>
              {check18PlusError()}
            </span>
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

const PaddingTitle = styled(Title)`
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

const PasswordReq = styled.p`
  font-size: 10px;
  font-style: italic;
`;

export default Privacy;
