import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Form } from 'react-bootstrap';
import { colors, fonts } from '../theme/styleVars';
import {
  ErrorMessage,
  requiredFieldMessage,
  validateRegex
} from '../utils/validation';

const InputField = (props: any) => {
  const {
    fieldType,
    label,
    name,
    onChange,
    placeholder,
    required,
    requiredLabel,
    pristineReqCallback,
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

  const hasErrorsCall = (hasE: boolean) => {
    hasErrorCallback && hasErrorCallback(name, hasE);
  };

  const resetErrorState = () => {
    setHasError(false);
    setErrorMessage('');
    hasErrorsCall(false);
  };

  useEffect(() => {
    // 0. if we're still pristine, don't show error messaging yet
    //    however, we may need to handle a pristine error callback
    if (isPristine) {
      if (required && pristineReqCallback) {
        pristineReqCallback(value.length < 1);
      }

      // find out when we need to unset pristine onChange of field
      if (value.length > 0) {
        setIsPristine(false);
        hasErrorsCall(false);

        if (required && pristineReqCallback) {
          pristineReqCallback(false);
        }
      } else {
        if (required) {
          hasErrorsCall(true);
        }
      }

      return;
    }

    // let's just start out with no errors
    hasErrorsCall(false);

    // 1. care about custom functions first
    if (validationFuncs?.length > 0) {
      let numFuncErrors = 0;
      let funcErrorMessage = '';

      validationFuncs.forEach((vF: () => boolean, vFi: number) => {
        if (typeof vF === 'function') {
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
      // 3. then care if it's required
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
