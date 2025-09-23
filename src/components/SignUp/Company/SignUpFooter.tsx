import React from 'react';
import { NavigationProps, Step } from 'react-hooks-helper';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/shared/Button';
import {
  ButtonCol,
  ButtonSection,
  FooterContent,
  PageFooterRow,
  Pagination,
  PaginationSection
} from '../SignUpFooterStyles';
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
  completeSignUp
}) => {
  const navigate = useNavigate();
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
      navigate('/profile');
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
              disabled={formStep === 'privacy'}
              onClick={onPreviousClick}
              text="Back"
              type="button"
              variant="secondary"
            />
          </ButtonCol>
          <ButtonCol className="continue-button">
            <Button
              disabled={isDisabled}
              onClick={onNextClick}
              text={nextText}
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
