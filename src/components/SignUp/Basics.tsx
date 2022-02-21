import React, { useEffect, useState } from 'react';
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
import { ErrorMessage } from '../../utils/validation';

const Privacy: React.FC<{
  setForm: any;
  formData: any;
  hasErrorCallback: (step: string, hasErrors: boolean) => void;
}> = props => {
  const { setForm, formData, hasErrorCallback } = props;
  const {
    basicsFirstName,
    basicsLastName,
    basicsEmailAddress,
    basicsPassword,
    basicsPasswordConfirm,
    basics18Plus
  } = formData;
  const requiredFields = [
    'basicsFirstName',
    'basicsLastName',
    'basicsEmailAddress',
    'basicsPassword',
    'basicsPasswordConfirm',
    'basics18Plus'
  ];
  const createDefaultFormErrorsData = () => {
    const formErrorsObj: { [key: string]: boolean } = {};

    requiredFields.forEach((fieldName: string) => {
      formErrorsObj[fieldName] =
        formData[fieldName] === '' || formData[fieldName] === false;
    });

    return formErrorsObj;
  };
  const [formErrors, setFormErrors] = useState(createDefaultFormErrorsData());

  const customErrorCallback = (hasErrors: boolean) => {
    hasErrorCallback('basics', hasErrors);
  };

  const customErrorCallbackField = (name: string, hasErrors: boolean) => {
    const newFormErrorsObj: typeof formErrors = { ...formErrors };

    if (name in newFormErrorsObj) {
      newFormErrorsObj[name] = hasErrors;
    }

    setFormErrors(newFormErrorsObj);
  };

  const customPasswordErrorFunc = () => {
    if (basicsPassword !== basicsPasswordConfirm) {
      return false;
    }

    return true;
  };

  const setFormErrors18Agree = () => {
    setFormErrors({ ...formErrors, basics18Plus: !basics18Plus });
  };

  useEffect(setFormErrors18Agree, [basics18Plus]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    customErrorCallback(!Object.values(formErrors).every(v => !v));
  }, [formErrors]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container>
      <Row>
        <PaddingTitle>LET'S GET TO KNOW EACH OTHER</PaddingTitle>
        <Col lg="4">
          <Form>
            <InputField
              hasErrorCallback={customErrorCallbackField}
              label="First"
              name="basicsFirstName"
              onChange={setForm}
              required={true}
              requiredLabel="First name"
              value={basicsFirstName || ''}
            />
            <InputField
              hasErrorCallback={customErrorCallbackField}
              label="Last"
              name="basicsLastName"
              onChange={setForm}
              required={true}
              requiredLabel="Last name"
              value={basicsLastName || ''}
            />
            <InputField
              hasErrorCallback={customErrorCallbackField}
              label="Email Address"
              name="basicsEmailAddress"
              onChange={setForm}
              required={true}
              requiredLabel="Email address"
              validationRegexMessage={ErrorMessage.EmailFormat}
              validationRegexName="emailAddress"
              value={basicsEmailAddress || ''}
            />
            <InputField
              fieldType="password"
              hasErrorCallback={customErrorCallbackField}
              label="Password"
              name="basicsPassword"
              onChange={setForm}
              required={true}
              requiredLabel="Password"
              validationRegexMessage={ErrorMessage.PasswordsRules}
              validationRegexName="password"
              value={basicsPassword || ''}
            />
            <PasswordReq>
              Minimum 8 characters, one uppercase letter, one lowercase letter,
              one number, and one special character.
            </PasswordReq>
            <InputField
              fieldType="password"
              hasErrorCallback={customErrorCallbackField}
              label="Confirm Password"
              name="basicsPasswordConfirm"
              onChange={setForm}
              required={true}
              requiredLabel="Password confirmation"
              validationFuncMessages={[ErrorMessage.PasswordsMatch]}
              validationFuncs={[customPasswordErrorFunc]}
              value={basicsPasswordConfirm || ''}
            />
            <Checkbox
              checked={basics18Plus || false}
              fieldType="checkbox"
              label="I confirm that I am at least 18 years of age or older"
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
