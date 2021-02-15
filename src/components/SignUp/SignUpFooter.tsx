import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

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

  return (
    <Row>
      <Col lg="2">
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
      <Col lg="8">
        <p>
          Step {steps.findIndex((s: any) => s.id === (step as any)) + 1} of{' '}
          {steps.length}
        </p>
      </Col>
      <Col lg="2">
        {step !== ('awards' as any) && (
          <Button
            onClick={navigationNext ? next : () => setLandingStep(2)}
            type="button"
            variant="primary"
          >
            Continue
          </Button>
        )}
      </Col>
    </Row>
  );
};

export default SignUpFooter;
