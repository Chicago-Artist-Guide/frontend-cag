import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { Step } from 'react-hooks-helper';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { FormStep, FormValues } from './types';

export const formSteps: FormStep[] = ['basics', 'details', 'privacy', 'photo'];

/**
 * @param  {step}} step=>({id
 */
export const defaultSteps: Step[] = formSteps.map(step => ({ id: step }));

/**
 * @param  {Step[]} steps - An array of steps used with react-hooks-helper
 * @returns {FormStep[]} - An array of step id's
 */
export function flattenSteps(steps: Step[]): FormStep[] {
  return steps.map(step => step.id as FormStep);
}

/**
 * @param  {string[]} steps
 * @returns {object} - An object to track a boolean true/false for which steps
 * have form validation error states
 */
export function createDefaultStepErrorsObj(steps: string[]): any {
  const stepErrorsObj: { [key: string]: boolean } = {};
  // default all of our steps to false
  // because the pages will update this themselves
  // when errors or empty req fields arise or exist
  steps.forEach((stepName: string) => {
    stepErrorsObj[stepName] = false;
  });

  return stepErrorsObj;
}
