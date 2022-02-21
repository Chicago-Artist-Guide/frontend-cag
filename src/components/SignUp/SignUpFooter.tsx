import React from 'react';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '../../genericComponents/Button';
import { colors } from '../../theme/styleVars';

const SignUpFooter: React.FC<{
  landingStep: any;
  landingType: string;
  navigation: any;
  setLandingStep: any;
  step: any;
  steps: any;
  submitBasics: any;
  stepErrors: { [key: string]: boolean };
}> = ({
  landingStep,
  landingType,
  navigation,
  setLandingStep,
  step,
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
  */
  const { next, previous } = navigation;
  const showBackButton = step !== ('landing' as any) || landingStep === 2;
  const backButtonLandingStep =
    step === ('landing' as any) && landingStep === 2;
  const navigationNext =
    (step === ('landing' as any) &&
      (landingStep === 2 || landingType === 'group')) ||
    (step !== ('landing' as any) && step !== ('privacy' as any));
  const stepIndex = steps.findIndex((s: any) => s.id === (step as any));
  const continueText =
    step === ('privacy' as any) ? 'Accept & Continue' : 'Continue';

  const privacyAgree = () => {
    submitBasics();
    next();
  };

  return (
    <PageFooterRow>
      <Col lg="4">
        {showBackButton && (
          <Button
            onClick={backButtonLandingStep ? () => setLandingStep(1) : previous}
            text="Back"
            type="button"
            variant="secondary"
          />
        )}
      </Col>
      <Col lg="4">
        <Pagination>
          {steps.map((s: any, i: number) => (
            <li
              className={
                i < stepIndex ? 'complete' : stepIndex === i ? 'active' : ''
              }
              key={`sign-up-footer-page-bubble-${stepIndex}-${i}`}
            />
          ))}
        </Pagination>
      </Col>
      <ButtonCol lg="4">
        {step !== ('awards' as any) && (
          <Button
            disabled={stepErrors[step]}
            onClick={
              navigationNext
                ? next
                : step === ('privacy' as any)
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

const PageFooterRow = styled(Row)`
  padding-top: 100px;
`;

const ButtonCol = styled(Col)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
`;

const Pagination = styled.ul`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: space-between;
  margin: 0;
  padding: 0;
  width: 100%;

  li {
    border: 1px solid ${colors.darkGreen};
    border-radius: 50%;
    height: 21px;
    list-style-type: none;
    width: 21px;

    &.complete {
      background: ${colors.darkGreen}50;
    }

    &.active {
      background: ${colors.darkGreen};
    }
  }
`;

export default SignUpFooter;
