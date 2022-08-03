import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Checkbox from '../../../genericComponents/Checkbox';
import InputField from '../../../genericComponents/Input';
import { colors } from '../../../theme/styleVars';
import { ErrorMessage } from '../../../utils/validation';
import { Title } from '../../layout/Titles';

const CompanyBasics: React.FC<{
  setForm: SetForm;
  formData: { [key: string]: any };
  formErrors: any;
  setFormErrors: (x: any) => void;
  hasErrorCallback: (step: string, hasErrors: boolean) => void;
}> = ({ setForm, formData, setFormErrors, formErrors, hasErrorCallback }) => {
  const {
    basicsTheatreName,
    basicsEmailAddress,
    basicsPassword,
    basicsPasswordConfirm
  } = formData;

  // create an array of the required field names
  const requiredFields = [
    'basicsTheatreName',
    'basicsEmailAddress',
    'basicsPassword',
    'basicsPasswordConfirm'
  ];

  // create a default object of required field values for state
  // the format is: fieldName: true (has error) | false (does not have error)
  // we default this for now based on if they are empty '' or false
  const createDefaultFormErrorsData = () => {
    const formErrorsObj: { [key: string]: boolean } = {};
    requiredFields.forEach((fieldName: string) => {
      formErrorsObj[fieldName] =
        formData[fieldName] === '' || formData[fieldName] === false;
    });

    return formErrorsObj;
  };

  useEffect(() => {
    setFormErrors(createDefaultFormErrorsData);
    console.log('object.values', !Object.values(formErrors).every(v => !v));
    customErrorCallback(
      !Object.values(createDefaultFormErrorsData).every(v => !v)
    );
  }, []);

  console.log('formErrors', formErrors);
  // then use createDefaultFormErrorsData() to fill our initial formErrors state for this page
  //   const [formErrors, setFormErrors] = useState(createDefaultFormErrorsData());

  // calls the custom callback for the sign up page errors state object
  // we just make this so we don't need to repeat "basics" everywhere
  const customErrorCallback = (hasErrors: boolean) =>
    hasErrorCallback('basics', hasErrors);

  // this is the callback we pass down for each input to update for its error state
  // it's used in the InputField "hasErrorCallback" attribute
  //   const customErrorCallbackField = (name: string, hasErrors: boolean) => {
  //     const newFormErrorsObj: typeof formErrors = { ...formErrors };
  //     if (name in newFormErrorsObj) {
  //       newFormErrorsObj[name] = hasErrors;
  //     }
  //     setFormErrors(newFormErrorsObj);
  //   };

  // this is the custom error func for password matching
  // we only need to give this to the basicsPasswordConfirm field
  // and it goes in the InputField array "validationFuncMessages" attribute
  const checkIfPasswordsMatch = () => {
    return basicsPassword === basicsPasswordConfirm;
  };

  // effect for updating the sign up page errors state for this page
  // every time formErrors is updated
  //   useEffect(() => {
  //     console.lo
  //     customErrorCallback(!Object.values(formErrors).every(v => !v));
  //   }, [formErrors]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container>
      <Row>
        <PaddingTitle>LET'S GET STARTED</PaddingTitle>
      </Row>
      <Row>
        <Col lg="4">
          <Form>
            <InputField
              hasErrorCallback={hasErrorCallback}
              label="Theatre Name"
              name="basicsTheatreName"
              onChange={setForm}
              required={true}
              requiredLabel="Theatre name"
              value={basicsTheatreName || ''}
            />
            <InputField
              hasErrorCallback={hasErrorCallback}
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
              hasErrorCallback={hasErrorCallback}
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
              hasErrorCallback={hasErrorCallback}
              label="Confirm Password"
              name="basicsPasswordConfirm"
              onChange={setForm}
              required={true}
              requiredLabel="Password confirmation"
              validationFuncMessages={[ErrorMessage.PasswordsMatch]}
              validationFuncs={[checkIfPasswordsMatch]}
              value={basicsPasswordConfirm || ''}
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

export default CompanyBasics;
