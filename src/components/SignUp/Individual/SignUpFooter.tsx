import React from 'react';
import { NavigationProps, Step } from 'react-hooks-helper';
import Button from '../../../components/shared/Button';
import { goToTop } from '../../../utils/goToTop';
import {
  PageFooterRow,
  FooterContent,
  ButtonSection,
  ButtonCol,
  PaginationSection,
  Pagination
} from '../SignUpFooterStyles';

const FORM_VALIDATION_ON = true;

export type SubmitBasicsResp = {
  ok: boolean;
  code?: string | number;
};

const SignUpFooter: React.FC<{
  landingStep: number;
  navigation: NavigationProps;
  setLandingStep: (x: number) => void;
  currentStep: string;
  steps: Step[];
  submitBasics: () => Promise<SubmitBasicsResp>;
  submitSignUpProfile: () => Promise<void>;
  stepErrors: { [key: string]: boolean };
  goToProfile: () => void;
}> = ({
  landingStep,
  navigation,
  setLandingStep,
  currentStep,
  steps,
  submitBasics,
  submitSignUpProfile,
  stepErrors,
  goToProfile
}) => {
  const { next, previous } = navigation;
  const navigationNext = landingStep === 2 || currentStep !== 'privacy';
  const stepIndex = steps.findIndex((step) => step.id === currentStep);
  const lastStep = steps[steps.length - 1];
  let continueText = 'Continue';

  switch (currentStep) {
    case 'privacy':
      continueText = 'Accept & Continue';
      break;
    case lastStep.id:
      continueText = 'Finish';
      break;
    default:
      continueText = 'Continue';
  }

  const prevButtonAction = (landingStep: number) => {
    goToTop();
    return landingStep === 0 ? setLandingStep(-1) : previous?.();
  };

  const nextButtonAction = async (navNext: boolean, currStep: string) => {
    goToTop();

    if (currStep === 'basics') {
      const submitted = await submitBasics();
      return submitted.ok && next();
    }

    // on the last step, submit data and go to profile
    if (currStep === lastStep.id) {
      await submitSignUpProfile();
      return goToProfile();
    }

    if (navNext) {
      return next();
    }

    // we're still in step 1
    return setLandingStep(2);
  };

  const isDisabled = stepErrors[currentStep] && FORM_VALIDATION_ON;

  return (
    <PageFooterRow>
      <FooterContent>
        <PaginationSection>
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
        </PaginationSection>

        <ButtonSection>
          <ButtonCol className="back-button">
            <Button
              onClick={() => prevButtonAction(landingStep)}
              text="Back"
              type="button"
              variant="secondary"
            />
          </ButtonCol>
          <ButtonCol className="continue-button">
            <Button
              disabled={isDisabled}
              onClick={() => nextButtonAction(navigationNext, currentStep)}
              text={continueText}
              type="button"
              variant="primary"
              style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
            />
          </ButtonCol>
        </ButtonSection>
      </FooterContent>
    </PageFooterRow>
  );
};

export default SignUpFooter;
