import React from 'react';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { colors } from '../../theme/styleVars';

const SignUpFooter: React.FC<{
  landingStep: any;
  landingType: string;
  navigation: any;
  setLandingStep: any;
  step: any;
  steps: any;
}> = ({
  landingStep,
  landingType,
  navigation,
  setLandingStep,
  step,
  steps
}) => {
  const { next, previous } = navigation;
  const showBackButton = step !== ('landing' as any) || landingStep === 2;
  const backButtonLandingStep =
    step === ('landing' as any) && landingStep === 2;
  const navigationNext =
    (step === ('landing' as any) &&
      (landingStep === 2 || landingType === 'group')) ||
    step !== ('landing' as any);
  const stepIndex = steps.findIndex((s: any) => s.id === (step as any));

  return (
    <PageFooterRow>
      <Col lg="4">
        {showBackButton && (
          <Button
            onClick={backButtonLandingStep ? () => setLandingStep(1) : previous}
            type="button"
            variant="secondary"
          >
            Back
          </Button>
        )}
      </Col>
      <Col lg="4">
        <Pagination>
          {steps.map((s: any, i: number) => (
            <li
              className={
                i < stepIndex ? 'complete' : stepIndex === i ? 'active' : ''
              }
            />
          ))}
        </Pagination>
      </Col>
      <ButtonCol lg="4">
        {step !== ('awards' as any) && (
          <Button
            onClick={navigationNext ? next : () => setLandingStep(2)}
            type="button"
            variant="primary"
          >
            Continue
          </Button>
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
  display: flex;
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
