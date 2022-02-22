import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Form } from 'react-bootstrap';
import { colors, fonts } from '../theme/styleVars';
import {
  ErrorMessage,
  requiredFieldMessage,
  validateRegex
} from '../utils/validation';

/*

Field Validation Prop Breakdown:

Required:
- required: boolean - field is required
- requiredLabel: string - name that goes into required error message. Should always have this with required prop

Regex
- validationRegexName: string - name of regex from validationRegex object in validation utils
- validationRegexMessage: string - message to show if value fails regex match (should use value from ErrorMessage enum)

Custom Validation Functions
- validationFuncs: function[] - an array of custom validation functions to check in order. Currenly, they do not take 
    any params, but you should have access to any specific data you need on the step page itself
- validationFuncMessages: string[] - an array of strings for the corresponding error messages for the validationFuncs.
    Should be in the same order as the validationFuncs

Parent Page
- hasErrorCallback: function - callback function to update the parent step page's error state object for required fields

*/

const InputField = (props: any) => {
  const {
    fieldType,
    label,
    name,
    onChange,
    placeholder,
    required,
    requiredLabel,
    validationRegexName,
    validationRegexMessage,
    validationFuncs,
    validationFuncMessages,
    hasErrorCallback,
    value,
    ...rest
  } = props;
  const [isPristine, setIsPristine] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // create a safe wrapper for possible hasErrorCallback
  const hasErrorsCall = (hasE: boolean) => {
    hasErrorCallback && hasErrorCallback(name, hasE);
  };

  // create a function to do the "no error" reset stuff
  // for when current conditional errors are resolved
  const resetErrorState = () => {
    setHasError(false);
    setErrorMessage('');
    hasErrorsCall(false);
  };

  // this is the huge effect for monitoring WHICH validation types we need to worry about
  // based on the props provided to the field and the logical prioritization if multiple exist
  useEffect(() => {
    // 0. if we're still pristine, don't show error messaging yet
    if (isPristine) {
      // find out when we need to unset pristine onChange of field
      if (value.length > 0) {
        setIsPristine(false);
        hasErrorsCall(false);
      } else {
        if (required) {
          hasErrorsCall(true);
        }
      }

      // just return here because the messaging doesn't matter if the field hasn't been touched yet
      return;
    }

    // let's just start out with no errors
    hasErrorsCall(false);

    // 1. care about custom functions first
    if (validationFuncs?.length > 0) {
      let numFuncErrors = 0;
      let funcErrorMessage = '';

      // loop through all custom functions since they're in an array
      validationFuncs.forEach((vF: () => boolean, vFi: number) => {
        if (typeof vF === 'function') {
          // add to our error count and error messages if the custom function fails
          if (!vF()) {
            numFuncErrors++;
            funcErrorMessage =
              validationFuncMessages[vFi] || ErrorMessage.Default;
          }
        }
      });

      setHasError(numFuncErrors > 0);
      setErrorMessage(funcErrorMessage);
      hasErrorsCall(numFuncErrors > 0);
    } else if (validationRegexName) {
      // 2. then care about regex
      if (!validateRegex(validationRegexName, value)) {
        setHasError(true);
        setErrorMessage(validationRegexMessage || ErrorMessage.Default);
        hasErrorsCall(true);
      } else {
        resetErrorState();
      }
    } else if (required) {
      // 3. finally, care if it's required
      if (value.length < 1) {
        setHasError(true);
        setErrorMessage(
          requiredFieldMessage(requiredLabel) || ErrorMessage.Default
        );
        hasErrorsCall(true);
      } else {
        resetErrorState();
      }
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <CAGInput>
        <CAGLabel>{label}</CAGLabel>
        <Form.Control
          aria-label={label}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={fieldType}
          {...rest}
        />
      </CAGInput>
      {hasError ? (
        <CAGError>{errorMessage || ErrorMessage.Default}</CAGError>
      ) : (
        <></>
      )}
    </>
  );
};

const CAGInput = styled(Form.Group)`
  box-shadow: 0px 13px 21px -10px rgba(0, 0, 0, 0.3);
  margin: 0px;
`;

const CAGLabel = styled(Form.Label)`
  color: ${colors.mainFont};
  font-family: ${fonts.mainFont};
  font-size: 20px;
  margin: 0px;
`;

const CAGError = styled.span`
  color: red;
  font-size: 12px;
`;

export default InputField;
