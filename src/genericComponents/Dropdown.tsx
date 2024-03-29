import React from 'react';
import {
  CAGFormGroup,
  CAGFormSelect,
  CAGLabel
} from '../components/SignUp/SignUpStyles';
import { colors } from '../theme/styleVars';

interface Props {
  name?: string;
  label?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string;
  options: Value[];
  style?: React.CSSProperties;
}

interface Value {
  name: string;
  value: string;
}

const DropdownMenu = ({
  name,
  label,
  onChange,
  value,
  options,
  style
}: Props) => {
  return (
    <CAGFormGroup controlId={name} style={style}>
      <CAGLabel>{label}</CAGLabel>
      <CAGFormSelect
        name={name}
        aria-label={label}
        defaultValue={value}
        onChange={onChange}
        placeholder="Choose one..."
        style={{
          border: `1px solid ${colors.lightGrey}`,
          color: value ? colors.secondaryFontColor : 'rgb(110, 115, 120)',
          fontWeight: 400,
          height: 40,
          maxWidth: 300
        }}
      >
        {options.map((option) => (
          <option
            key={option.value}
            // selected={option.value === value}
            value={option.value}
          >
            {option.name}
          </option>
        ))}
      </CAGFormSelect>
    </CAGFormGroup>
  );
};

export default DropdownMenu;
