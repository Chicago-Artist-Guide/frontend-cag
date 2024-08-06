// Simple function for making required fields error messages
export const requiredFieldMessage = (name: string, override?: string) =>
  override ?? `${name} is required`;

// enum for other error messages we use
export enum ErrorMessage {
  Default = 'Please enter a valid response',
  EmailFormat = 'Email address format is not valid',
  PasswordsMatch = 'Passwords must match',
  PasswordsSize = 'Password must be at least 8 characters',
  PasswordsRules = 'Password is invalid',
  Verify18 = 'Please check the box to verify you are 18 years old or older'
}

// object for our regex
export const validationRegex: { password: RegExp; emailAddress: RegExp } = {
  password:
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/, // eslint-disable-line no-useless-escape
  emailAddress:
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ // eslint-disable-line no-useless-escape
} as const;

// function for checking regex match
// "type" must reference a key in validationRegex above
export const validateRegex = (
  type: keyof typeof validationRegex,
  value: string
) => !!value.match(validationRegex[type]);
