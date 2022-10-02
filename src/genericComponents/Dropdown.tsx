import React from 'react';
import {
  CAGFormControl,
  CAGFormGroup,
  CAGLabel
} from '../components/SignUp/SignUpStyles';
import { colors } from '../theme/styleVars';

interface Props {
  controlId?: string;
  label?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string;
  options: Value[];
}

interface Value {
  name: string;
  value: string;
}

const DropdownMenu = ({
  controlId,
  label,
  onChange,
  value,
  options
}: Props) => {
  return (
    <CAGFormGroup controlId={controlId}>
      <CAGLabel>{label}</CAGLabel>
      <CAGFormControl
        as="select"
        name={controlId}
        aria-label={label}
        defaultValue={value}
        onChange={onChange}
        placeholder="Choose one..."
        style={{
          border: `1px solid ${colors.lightGrey}`,
          color: value ? colors.secondaryFontColor : colors.lightGrey,
          fontWeight: 400,
          height: 40,
          maxWidth: 256
        }}
      >
        {options.map(option => (
          <option selected={option.value === value} value={value}>
            {option.name}
          </option>
        ))}
      </CAGFormControl>
    </CAGFormGroup>
  );
};

export default DropdownMenu;
