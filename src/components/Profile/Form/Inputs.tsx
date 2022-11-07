import React from 'react';
import { Form } from 'react-bootstrap';
import { SetForm } from 'react-hooks-helper';
import styled, { CSSProperties } from 'styled-components';
import { colors, fonts } from '../../../theme/styleVars';

interface SelectValue {
  name: string;
  value: string;
}

export const FormTextArea: React.FC<{
  name: string;
  label: string;
  defaultValue: any;
  onChange: SetForm;
  style?: CSSProperties;
}> = ({ name, label, defaultValue, onChange, ...rest }) => {
  return (
    <FormGroup controlId={name} {...rest}>
      <Label>{label}</Label>
      <TextArea
        as="textarea"
        rows={10}
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
  defaultValue: any;
  onChange: SetForm;
  style?: CSSProperties;
}> = ({ name, label, defaultValue, onChange, ...rest }) => {
  return (
    <FormGroup controlId={name} {...rest}>
      <Label>{label}</Label>
      <Input
        aria-label={name}
        name={name}
        onChange={onChange}
        defaultValue={defaultValue}
      />
    </FormGroup>
  );
};

export const FormSelect: React.FC<{
  name: string;
  label: string;
  defaultValue: any;
  onChange: SetForm;
  options: SelectValue[];
}> = ({ name, label, defaultValue, onChange, options }) => {
  return (
    <FormGroup controlId={name}>
      <Label>{label}</Label>
      <Select
        aria-label={name}
        name={name}
        placeholder="Choose one..."
        onChange={onChange}
        defaultValue={defaultValue}
        style={{
          color: defaultValue ? colors.secondaryFontColor : colors.lightGrey
        }}
      >
        {options.map(option => (
          <option key={option.value}>{option.name}</option>
        ))}
      </Select>
    </FormGroup>
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
`;

export const Select = styled(Form.Select)`
  border-radius: 4px;
  padding: 8px 13px 8px 13px;
  border: 1px solid ${colors.lightGrey};
  fontweight: 400;
  height: 52px;
  max-width: 300px;
`;

export const TextArea = styled(Form.Control)`
	border-radius: 4px;
	padding: 8px 13px 8px 13px;
	border: 1px solid ${colors.lightGrey};
	color: defaultValue ? colors.secondaryFontColor : colors.lightGrey;
	fontWeight: 400;
	maxWidth: 800px
`;
