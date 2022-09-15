import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import InputField from '../../../genericComponents/Input';
import { colors } from '../../../theme/styleVars';
import { ErrorMessage } from '../../../utils/validation';
import SignUpHeader from '../shared/Header';
import { CompanyFormData } from './types';

const CompanyBasics: React.FC<{
  setForm: SetForm;
  formData: CompanyFormData;
  formErrors: any;
  setFormErrors: (x: any) => void;
  hasErrorCallback: (step: string, hasErrors: boolean) => void;
}> = ({ setForm, formData, setFormErrors, formErrors, hasErrorCallback }) => {
  const { theatreName, emailAddress, password, passwordConfirm } = formData;

  // create an array of the required field names
  const requiredFields = [
    'theatreName',
    'emailAddress',
    'password',
    'passwordConfirm'
  ];

  // create a default object of required field values for state
  // the format is: fieldName: true (has error) | false (does not have error)
  // we default this for now based on if they are empty '' or false
  const createDefaultFormErrorsData = () => {
    const formErrorsObj: { [key: string]: boolean } = {};
    // TODO: Finish validation and error checking
    // requiredFields.forEach((fieldName: string) => {
    //   formErrorsObj[fieldName] = !formData[fieldName];
    // });

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
    return password === passwordConfirm;
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
        <SignUpHeader
          title="LET'S GET STARTED"
          subtitle="This is a subheader that may or may not be used on any given page"
        />
      </Row>
      <Row>
        <Col lg="4">
          <Form>
            <InputField
              required
              placeholder="Theatre Name"
              hasErrorCallback={hasErrorCallback}
              name="theatreName"
              onChange={setForm}
              requiredLabel="Theatre name"
              value={theatreName || ''}
            />
            <InputField
              required
              hasErrorCallback={hasErrorCallback}
              placeholder="Email Address"
              name="emailAddress"
              onChange={setForm}
              requiredLabel="Email address"
              validationRegexMessage={ErrorMessage.EmailFormat}
              validationRegexName="emailAddress"
              value={emailAddress || ''}
            />
            <InputField
              required
              fieldType="password"
              hasErrorCallback={hasErrorCallback}
              placeholder="Password"
              name="password"
              onChange={setForm}
              requiredLabel="Password"
              validationRegexMessage={ErrorMessage.PasswordsRules}
              validationRegexName="password"
              value={password || ''}
              helperText="Minimum 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
            />
            <InputField
              required
              fieldType="password"
              hasErrorCallback={hasErrorCallback}
              placeholder="Confirm Password"
              name="passwordConfirm"
              onChange={setForm}
              requiredLabel="Password confirmation"
              validationFuncMessages={[ErrorMessage.PasswordsMatch]}
              validationFuncs={[checkIfPasswordsMatch]}
              value={passwordConfirm || ''}
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

const LoginLink = styled.p`
  font-size: 0.875rem;
  font-weight: 520;
  letter-spacing: 0.14px;
  margin-top: 10px;
  a {
    color: ${colors.orange};
  }
`;

export default CompanyBasics;
