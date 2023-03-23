import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Form } from 'react-bootstrap';
import { SetForm } from 'react-hooks-helper';
import { SubmitBasicsResp } from './SignUpFooter';
import { Title } from '../../layout/Titles';
import InputField from '../../../genericComponents/Input';
import Checkbox from '../../../genericComponents/Checkbox';
import { colors } from '../../../theme/styleVars';
import { ErrorMessage } from '../../../utils/validation';
import type { IndividualData } from './types';

const IndividualBasics: React.FC<{
  setForm: SetForm;
  formData: IndividualData;
  hasErrorCallback: (step: string, hasErrors: boolean) => void;
  submitBasicsErr: SubmitBasicsResp | undefined;
}> = (props) => {
  const { setForm, formData, hasErrorCallback, submitBasicsErr } = props;
  const {
    basicsFirstName,
    basicsLastName,
    basicsEmailAddress,
    basicsPassword,
    basicsPasswordConfirm,
    basics18Plus
  } = formData;

  // create an array of the required field names
  const requiredFields = [
    'basicsFirstName',
    'basicsLastName',
    'basicsEmailAddress',
    'basicsPassword',
    'basicsPasswordConfirm',
    'basics18Plus'
  ];

  // create a default object of required field values for state
  // the format is: fieldName: true (has error) | false (does not have error)
  // we default this for now based on if they are empty '' or false
  const createDefaultFormErrorsData = () => {
    const formErrorsObj: { [key: string]: boolean } = {};

    requiredFields.forEach((fieldName: string) => {
      formErrorsObj[fieldName] =
        formData[fieldName as keyof IndividualData] === '' ||
        !formData[fieldName as keyof IndividualData];
    });

    return formErrorsObj;
  };

  // then use createDefaultFormErrorsData() to fill our initial formErrors state for this page
  const [formErrors, setFormErrors] = useState(createDefaultFormErrorsData());

  // calls the custom callback for the sign up page errors state object
  // we just make this so we don't need to repeat "basics" everywhere
  const customErrorCallback = (hasErrors: boolean) =>
    hasErrorCallback('basics', hasErrors);

  // this is the callback we pass down for each input to update for its error state
  // it's used in the InputField "hasErrorCallback" attribute
  const customErrorCallbackField = (name: string, hasErrors: boolean) => {
    const newFormErrorsObj: typeof formErrors = { ...formErrors };

    if (name in newFormErrorsObj) {
      newFormErrorsObj[name] = hasErrors;
    }

    setFormErrors(newFormErrorsObj);
  };

  // this is the custom error func for password matching
  // we only need to give this to the basicsPasswordConfirm field
  // and it goes in the InputField array "validationFuncMessages" attribute
  const customPasswordErrorFunc = () => {
    if (basicsPassword !== basicsPasswordConfirm) {
      return false;
    }

    return true;
  };

  // create a separate function just for checking our 18+ checkbox
  // since we can't handle this the same way as other inputs
  const setFormErrors18Agree = () => {
    setFormErrors({ ...formErrors, basics18Plus: !basics18Plus });
  };

  // special effect just for 18+ checkbox using setFormErrors18Agree
  useEffect(setFormErrors18Agree, [basics18Plus]); // eslint-disable-line react-hooks/exhaustive-deps

  // effect for updating the sign up page errors state for this page
  // every time formErrors is updated
  useEffect(() => {
    customErrorCallback(!Object.values(formErrors).every((v) => !v));
  }, [formErrors]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container>
      <Row>
        <Col lg="8">
          <PaddingTitle>LET'S GET TO KNOW EACH OTHER</PaddingTitle>
          {submitBasicsErr && (
            <Alert key="danger" variant="danger">
              <strong>Error signing up:</strong> {submitBasicsErr.code}
            </Alert>
          )}
        </Col>
      </Row>
      <Row>
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
              className="form-group"
            />
            <CAGCheckbox
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

const CAGCheckbox = styled(Checkbox)`
  margin-top: 2em;
`;

export default IndividualBasics;
