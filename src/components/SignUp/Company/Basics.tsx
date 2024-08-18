import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import InputField from '../../../genericComponents/Input';
import { colors, fonts } from '../../../theme/styleVars';
import { ErrorMessage } from '../../../utils/validation';
import SignUpBody from '../shared/Body';
import SignUpHeader from '../shared/Header';
import { CompanyData } from './types';
import { checkForErrors } from './utils';

const requiredFields = ['theatreName', 'emailAddress', 'password'];

const CompanyBasics: React.FC<{
  stepId: string;
  errors: { [key: string]: string };
  setForm: SetForm;
  formValues: CompanyData;
  setStepErrors: (step: string, hasErrors: boolean) => void;
}> = ({ stepId, setForm, formValues, errors, setStepErrors }) => {
  const { theatreName, emailAddress, password } = formValues;

  useEffect(() => {
    if (requiredFields.length > 0) {
      const hasErrors = checkForErrors(requiredFields, formValues);
      setStepErrors(stepId, hasErrors);
    }
  }, [formValues]);

  return (
    <Container>
      <Row>
        <SignUpHeader title="LET'S GET STARTED" />
      </Row>
      <Row>
        <SignUpBody lg="4">
          <Form>
            <InputField
              required
              placeholder="Theatre Name"
              hasErrorCallback={setStepErrors}
              name="theatreName"
              error={errors.theatreName}
              onChange={setForm}
              requiredLabel="Theatre name"
              value={theatreName || ''}
            />
            <InputField
              required
              hasErrorCallback={setStepErrors}
              placeholder="Theatre Email Address"
              name="emailAddress"
              onChange={setForm}
              error={errors.emailAddress}
              requiredLabel="Theatre Email Address"
              validationRegexMessage={ErrorMessage.EmailFormat}
              validationRegexName="emailAddress"
              value={emailAddress || ''}
            />
            <InputField
              required
              fieldType="password"
              hasErrorCallback={setStepErrors}
              placeholder="Password"
              name="password"
              onChange={setForm}
              error={errors.password}
              requiredLabel="Password"
              validationRegexMessage={ErrorMessage.PasswordsRules}
              validationRegexName="password"
              value={password || ''}
              helperText="Minimum 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
            />
          </Form>
          <LoginLink>
            Already a member? <Link to="/login">Log in here</Link>
          </LoginLink>
        </SignUpBody>
        <Col lg="4"></Col>
        <Col lg="4"></Col>
      </Row>
    </Container>
  );
};

const LoginLink = styled.p`
  font-size: 14px;
  font-weight: 520;
  letter-spacing: 0.14px;
  font-style: italic;
  margin-top: 10px;
  margin-left: 4px;
  font-family: ${fonts.lora};
  a {
    color: ${colors.salmon};
  }
`;

export default CompanyBasics;
