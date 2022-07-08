import React from 'react';
import Col from 'react-bootstrap/Col';
import { NavigationProps, Step } from 'react-hooks-helper';
import Button from '../../genericComponents/Button';
import { ButtonCol, PageFooterRow, Pagination } from './SignUpFooterStyles';

// for dev
const FORM_VALIDATION_ON = true;

const SignUpFooter: React.FC<{
  landingStep: number;
  navigation: NavigationProps;
  setLandingStep: (x: number) => void;
  currentStep: string;
  steps: Step[];
  submitBasics: () => void;
  stepErrors: { [key: string]: boolean };
}> = ({
  landingStep,
  navigation,
  setLandingStep,
  currentStep,
  steps,
  submitBasics,
  stepErrors
}) => {
  /*
    SPECIAL CASES:
    1. We don't want a back button unless we're:
      - Past the Landing step OR
      - Past the 1st step of the Landing step
    2. We don't want to show our global navigation next button unless we're:
      - Past the Landing step OR
      - Past the 1st step of the Landing step OR
      - A Theater Group was selected (meaning no 2nd internal Landing step)
      - Not on the Privacy Step (we have a different callback for Privacy in order to set agreement)
    3. We need to show different button text for the Privacy Agreement step
    4. We need to set our form field "privacyAgreement" to true if we Agree & Continue in the Privacy step
    5. We don't want to show our Next button if we're on the last step (Awards)
      - We'll show "Go to Profile" when we tackle that step in development
    6. We disable the Next button if we have form validation errors or req fields not filled in
      - Done using stepErrors prop for current step (stepErrors[step])
  */

  // console.log('SignUpFooter', { currentStep, landingStep, steps, stepErrors });

  const { next, previous } = navigation;
  const navigationNext =
    (currentStep === 'landing' && landingStep === 2) ||
    (currentStep !== 'landing' && currentStep !== 'privacy');
  const stepIndex = steps.findIndex(step => step.id === currentStep);
  const continueText =
    currentStep === 'privacy' ? 'Accept & Continue' : 'Continue';

  const privacyAgree = () => {
    submitBasics();
    next();
  };

  return (
    <PageFooterRow>
      <Col lg="2">
        <Button
          onClick={landingStep === 0 ? () => setLandingStep(-1) : previous}
          text="Back"
          type="button"
          variant="secondary"
        />
      </Col>
      <Col lg="8">
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
      <ButtonCol lg="2">
        {currentStep !== ('awards' as any) && (
          <Button
            disabled={stepErrors[currentStep] && FORM_VALIDATION_ON}
            onClick={
              navigationNext
                ? next
                : currentStep === 'privacy'
                ? privacyAgree
                : () => setLandingStep(2)
            }
            text={continueText}
            type="button"
            variant="primary"
          />
        )}
      </ButtonCol>
    </PageFooterRow>
  );
};

export default SignUpFooter;
