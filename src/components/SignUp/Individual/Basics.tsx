import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Checkbox from '../../../components/shared/Checkbox';
import InputField from '../../../components/shared/Input';
import Red_Blob from '../../../images/red_blob.svg';
import { colors, breakpoints } from '../../../theme/styleVars';
import { ErrorMessage } from '../../../utils/validation';
import { Title } from '../../layout/Titles';
import { SubmitBasicsResp } from './SignUpFooter';
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
    basics18Plus,
    emailListAgree
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
        <Col lg="8" xs="12">
          <PaddingTitle>LET'S GET TO KNOW EACH OTHER</PaddingTitle>
          {submitBasicsErr?.code && !submitBasicsErr.ok && (
            <Alert key="danger" variant="danger">
              <strong>Error signing up:</strong> {submitBasicsErr.code}
            </Alert>
          )}
        </Col>
      </Row>
      <Row>
        <Col lg="4" xs="12">
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
            <hr />
            <CAGCheckbox
              checked={emailListAgree || false}
              fieldType="checkbox"
              label="I agree to join the email list to stay up-to-date with Chicago Artist Guide!"
              name="emailListAgree"
              onChange={setForm}
            />
            <hr />
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
        <Col lg="2" className="d-none d-lg-block" />
        <Col lg="6" className="d-none d-lg-block">
          <img alt="Chicago Artist Guide" src={Red_Blob} />
        </Col>
      </Row>
    </Container>
  );
};

const PaddingTitle = styled(Title)`
  padding: 48px 0px;

  @media (max-width: ${breakpoints.md}) {
    padding: 24px 0px;
    font-size: 24px;
  }
`;

const LoginLink = styled.p`
  text-align: left;
  font-size: 14px/18px;
  font-style: italic;
  letter-spacing: 0.14px;
  margin-top: 40px;

  a {
    color: ${colors.salmon};
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }

  @media (max-width: ${breakpoints.md}) {
    margin-top: 24px;
    font-size: 14px;
  }
`;

const PasswordReq = styled.p`
  font-size: 10px;
  font-style: italic;

  @media (max-width: ${breakpoints.md}) {
    font-size: 12px;
    margin-top: 8px;
  }
`;

const CAGCheckbox = styled(Checkbox)`
  margin-top: 2em;

  @media (max-width: ${breakpoints.md}) {
    margin-top: 1.5em;

    label {
      min-height: 44px;
      display: flex;
      align-items: center;
      padding: 8px 0;
    }
  }
`;

export default IndividualBasics;
