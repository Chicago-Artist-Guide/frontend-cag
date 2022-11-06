import { Step } from 'react-hooks-helper';
import { FormStep } from './types';

export const formSteps: FormStep[] = ['basics', 'details', 'privacy', 'photo'];

export const defaultSteps: Step[] = formSteps.map(step => ({ id: step }));

export const flattenSteps = (steps: Step[]) => {
  return steps.map(step => step.id as FormStep) as FormStep[];
};

export const defaultErrorState = formSteps.reduce(
  (acc, cur) => ({ ...acc, [cur]: false }),
  {}
) as {
  [key: string]: boolean;
};

export const defaultFormState = {
  theatreName: '',
  emailAddress: '',
  password: '',
  passwordConfirm: '',
  numberOfMembers: '',
  primaryContact: '',
  location: '',
  description: '',
  privacyAgreement: false,
  profilePhotoUrl: ''
};
