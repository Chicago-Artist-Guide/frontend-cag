import React from 'react';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { SetForm } from 'react-hooks-helper';
import styled, { CSSProperties } from 'styled-components';
import { breakpoints, colors, fonts } from '../../../theme/styleVars';

import 'react-datepicker/dist/react-datepicker.css';

export interface SelectValue {
  name: string;
  value: string;
}

export type OptGroupSelectValue = {
  [key: string]: {
    category: string;
    name: string;
    options: SelectValue[];
  };
};

export const FormTextArea: React.FC<{
  name: string;
  label: string;
  defaultValue: string | number | readonly string[] | undefined;
  onChange: SetForm;
  style?: CSSProperties;
  rows?: number;
  required?: boolean;
}> = ({
  name,
  label,
  defaultValue,
  onChange,
  rows = 10,
  required = false,
  ...rest
}) => {
  return (
    <FormGroup controlId={name} {...rest}>
      <Label>
        {label}
        {required && <RequiredAsterisk>*</RequiredAsterisk>}
      </Label>
      <TextArea
        as="textarea"
        rows={rows}
        aria-label={name}
        name={name}
        onChange={onChange}
        defaultValue={defaultValue}
      />
    </FormGroup>
  );
};

export const FormInput: React.FC<{
  name: string;
  label: string;
  defaultValue: string | number | readonly string[] | undefined;
  onChange: SetForm;
  style?: CSSProperties;
  type?: 'text' | 'number';
  placeholder?: string;
  required?: boolean;
}> = ({
  name,
  label,
  defaultValue,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  ...rest
}) => {
  return (
    <FormGroup controlId={name} {...rest}>
      <Label>
        {label}
        {required && <RequiredAsterisk>*</RequiredAsterisk>}
      </Label>
      <Input
        aria-label={name}
        name={name}
        onChange={onChange}
        defaultValue={defaultValue}
        type={type}
        placeholder={placeholder}
      />
    </FormGroup>
  );
};

export const FormSelect: React.FC<{
  name: string;
  label: string;
  defaultValue: string | number | readonly string[] | undefined;
  onChange: SetForm;
  options: SelectValue[] | OptGroupSelectValue;
  hasOptGroups?: boolean;
  required?: boolean;
}> = ({
  name,
  label,
  defaultValue,
  onChange,
  options,
  hasOptGroups = false,
  required = false
}) => {
  return (
    <FormGroup controlId={name}>
      <Label>
        {label}
        {required && <RequiredAsterisk>*</RequiredAsterisk>}
      </Label>
      <Select
        aria-label={name}
        name={name}
        placeholder="Choose one..."
        onChange={onChange}
        value={defaultValue}
      >
        {hasOptGroups ? (
          <>
            {!Array.isArray(options) &&
              Object.keys(options).map((cat) => (
                <optgroup label={options[cat].name} key={options[cat].category}>
                  {Array.isArray(options[cat].options) &&
                    options[cat].options.map((option) => (
                      <option key={option.value}>{option.name}</option>
                    ))}
                </optgroup>
              ))}
          </>
        ) : (
          <>
            {Array.isArray(options) &&
              options.map((option) => (
                <option key={option.value}>{option.name}</option>
              ))}
          </>
        )}
      </Select>
    </FormGroup>
  );
};

export const FormRadio: React.FC<{
  name: string;
  label: string;
  checked?: string;
  onChange: SetForm;
  options: SelectValue[];
}> = ({ name, label, checked, onChange, options }) => {
  const handleChange = (e: any) => {
    e.persist();
    onChange({
      target: {
        name: name,
        value: e.target.value
      }
    });
  };

  return (
    <FormGroup controlId={name}>
      <Label>{label}</Label>
      {options.map((option) => (
        <Radio
          type="radio"
          onChange={handleChange}
          key={option.value}
          id={name}
          value={option.value}
          label={option.name}
          aria-label={option.name}
          checked={checked === option.value}
        />
      ))}
    </FormGroup>
  );
};

export const FormDateRange: React.FC<{
  name: string;
  label: string;
  startValue?: string;
  endValue?: string;
  onChange: SetForm;
}> = ({ name, label, startValue, endValue, onChange }) => {
  return (
    <FormGroup controlId={name}>
      <Label>{label}</Label>
      <DateRange>
        <FormDatePicker
          name={`${name}_start`}
          onChange={onChange}
          defaultValue={startValue}
        />
        <Thru>thru</Thru>
        <FormDatePicker
          name={`${name}_end`}
          onChange={onChange}
          defaultValue={endValue}
        />
      </DateRange>
    </FormGroup>
  );
};

const FormDatePicker: React.FC<{
  name: string;
  defaultValue?: string;
  onChange: SetForm;
}> = ({ name, defaultValue, onChange }) => {
  const handleChange = (date: any) => {
    const dateString = new Date(date).toLocaleDateString();

    onChange({
      target: {
        name: name,
        value: dateString
      }
    });
  };

  return (
    <DatePickerInput
      name={name}
      onChange={handleChange}
      value={defaultValue}
      selected={defaultValue ? new Date(defaultValue) : undefined}
      placeholderText="mm/dd/yyyy"
    />
  );
};

export const FormGroup = styled(Form.Group)`
  margin: 25px 0 0;
  display: flex;
  flex-direction: column;
`;

export const Label = styled(Form.Label)`
  color: ${colors.dark};
  font-family: ${fonts.mainFont};
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.5px;
`;

export const Input = styled(Form.Control)`
  height: 52px;
  border-radius: 4px;
  padding: 8px 13px 8px 13px;
  max-width: 300px;
  background-color: ${colors.white} !important;
  color: ${colors.secondaryFontColor} !important;

  @media (max-width: ${breakpoints.md}) {
    width: 100%;
    max-width: 100%;
    padding: 12px 16px;
  }
`;

export const Select = styled(Form.Select)`
  border-radius: 4px;
  padding: 8px 13px 8px 13px;
  border: 1px solid ${colors.lightGrey};
  fontweight: 400;
  height: 52px;
  max-width: 300px;
  background-color: ${colors.white} !important;
  color: ${colors.secondaryFontColor} !important;

  @media (max-width: ${breakpoints.md}) {
    width: 100%;
    max-width: 100%;
    padding: 12px 16px;
  }
`;

export const Radio = styled(Form.Check)`
  color: ${colors.dark};
  font-family: ${fonts.mainFont};
  line-height: 24px;
  letter-spacing: 0.5px;
  font-weight: 400;
`;

export const TextArea = styled(Form.Control)`
  border-radius: 4px;
  padding: 8px 13px 8px 13px;
  border: 1px solid ${colors.lightGrey};
  background-color: ${colors.white} !important;
  color: ${(props) =>
    props.defaultValue
      ? colors.secondaryFontColor
      : colors.lightGrey} !important;
  fontweight: 400;
  maxwidth: 800px;

  @media (max-width: ${breakpoints.md}) {
    width: 100%;
    max-width: 100%;
    padding: 12px 16px;
  }
`;

const DateRange = styled.div`
  display: flex;
  gap: 0.75em;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: ${breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5em;
  }

  @media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg}) {
    gap: 0.5em;
  }
`;

const DatePickerInput = styled(DatePicker)`
  height: 40px;
  width: 100%;
  max-width: 148px;
  border-radius: 4px;
  border: 1px solid #d4d6df;
  padding-left: 10px;
  letter-spacing: 0.5px;
  color: ${colors.mainFont};
  opacity: 0.5;

  @media (max-width: ${breakpoints.md}) {
    max-width: 100%;
    width: 100%;
    padding-left: 12px;
  }

  @media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg}) {
    max-width: 140px;
  }
`;

const Thru = styled.h6`
  color: ${colors.italicColor};
  font-family: ${fonts.mainFont};
  font-size: 12px;
  line-height: 20px;
  letter-spacing: 0.25px;
  margin-bottom: 0;
  white-space: nowrap;

  @media (max-width: ${breakpoints.md}) {
    align-self: center;
    margin: 0.25em 0;
  }
`;

const RequiredAsterisk = styled.span`
  color: #dc3545;
  margin-left: 4px;
  font-weight: 600;
`;
