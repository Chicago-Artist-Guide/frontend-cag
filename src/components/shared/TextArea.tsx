import React from 'react';
import { FormProps } from 'react-bootstrap';
import { colors } from '../../theme/styleVars';
import { ErrorMessage, validationRegex } from '../../utils/validation';
import {
  CAGError,
  CAGFormControl,
  CAGFormGroup,
  CAGHelperText,
  CAGLabel
} from '../SignUp/SignUpStyles';

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

type Props = {
  fieldType?: string;
  hasErrorCallback?: (name: string, hasError: boolean) => void;
  helperText?: string;
  label?: string;
  name?: string;
  onChange?: any;
  placeholder?: string;
  required?: boolean;
  requiredLabel?: string;
  validationFuncMessages?: string[];
  validationFuncs?: any;
  validationRegexMessage?: string;
  validationRegexName?: keyof typeof validationRegex;
  value?: string | number;
} & Omit<FormProps, 'onChange'>;

const TextArea = (props: Props) => {
  const { label, name = '', onChange, placeholder, helperText, value } = props;
  const hasError = false;
  const errorMessage = '';

  return (
    <>
      <CAGFormGroup controlId={name}>
        <CAGLabel>{label}</CAGLabel>
        <CAGFormControl
          as="textarea"
          aria-label={label}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          rows={5}
          style={{
            border: `1px solid ${colors.lightGrey}`,
            color: value ? colors.secondaryFontColor : colors.lightGrey,
            fontWeight: 400,
            maxWidth: 440
          }}
        />
      </CAGFormGroup>
      {hasError && <CAGError>{errorMessage || ErrorMessage.Default}</CAGError>}
      {helperText && <CAGHelperText>{helperText}</CAGHelperText>}
    </>
  );
};

export default TextArea;
