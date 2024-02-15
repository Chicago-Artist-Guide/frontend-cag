import React from 'react';
import Col from 'react-bootstrap/Col';
import { NavigationProps, Step } from 'react-hooks-helper';
import { useHistory } from 'react-router-dom';
import Button from '../../../genericComponents/Button';
import { ButtonCol, PageFooterRow, Pagination } from '../SignUpFooterStyles';
import { FormStep, SubmitResponse } from './types';

const FORM_VALIDATION_ON = true;

const SignUpFooter: React.FC<{
  navigation: NavigationProps;
  setLandingStep: (x: number) => void;
  formStep: FormStep;
  steps: Step[];
  setErrors: (step: string, hasErrors: boolean) => void;
  submitBasics: () => Promise<SubmitResponse>;
  completeSignUp: () => Promise<void>;
  stepErrors: { [key: string]: boolean };
}> = ({
  navigation,
  setLandingStep,
  formStep,
  steps,
  submitBasics,
  stepErrors,
  setErrors,
  completeSignUp
}) => {
  const history = useHistory();
  const { next, previous } = navigation;
  const stepIndex = steps.findIndex((step) => step.id === formStep);
  const nextText = formStep === 'privacy' ? 'Accept & Continue' : 'Continue';

  const onNextClick = async () => {
    if (formStep === 'basics') {
      const submitted = await submitBasics();
      if (submitted.ok) {
        next();
      }
      return;
    }

    if (formStep === 'details') {
      await completeSignUp();
      history.push('/profile');
      return;
    }
    next();
  };

  const onPreviousClick = () => {
    if (formStep === 'basics') {
      setLandingStep(-1);
      return;
    }
    previous?.();
  };

  const isDisabled = stepErrors[formStep] && FORM_VALIDATION_ON;

  return (
    <PageFooterRow>
      <Col lg="4">
        <Button
          disabled={formStep === 'privacy'}
          onClick={onPreviousClick}
          text="Back"
          type="button"
          variant="secondary"
        />
      </Col>
      <Col lg="4">
        <Pagination>
          {steps.map((_step, i: number) => (
            <li
              className={
                i < stepIndex ? 'complete' : stepIndex === i ? 'active' : ''
              }
              key={`sign-up-footer-page-bubble-${stepIndex}-${i}`}
            >
              <span>{i + 1}</span>
            </li>
          ))}
        </Pagination>
      </Col>
      <ButtonCol lg="4">
        <Button
          disabled={isDisabled}
          onClick={onNextClick}
          text={nextText}
          type="button"
          variant="primary"
          style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
        />
      </ButtonCol>
    </PageFooterRow>
  );
};

export default SignUpFooter;
