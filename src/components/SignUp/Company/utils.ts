import { Step } from 'react-hooks-helper';
import { FormStep } from './types';

export const formSteps: FormStep[] = ['basics', 'privacy', 'details', 'photo'];

export const defaultSteps: Step[] = formSteps.map((step) => ({ id: step }));

export const flattenSteps = (steps: Step[]) => {
  return steps.map((step) => step.id as FormStep) as FormStep[];
};

export const defaultErrorState = formSteps.reduce(
  (acc, cur) => ({ ...acc, [cur]: false }),
  {}
) as {
  [key: string]: boolean;
};

export const checkForErrors = <T>(requiredFields: string[], formValues: T) => {
  return requiredFields.some((field) => {
    return !formValues[field as keyof T] as boolean;
  });
};

export const defaultFormState = {
  theatreName: '',
  emailAddress: '',
  password: '',
  passwordConfirm: '',
  numberOfMembers: '',
  primaryContact: '',
  primaryContactEmail: '',
  location: '',
  description: '',
  privacyAgreement: false,
  profilePhotoUrl: ''
};
