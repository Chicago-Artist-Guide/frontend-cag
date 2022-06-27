import React from 'react';
import Col from 'react-bootstrap/Col';
import Button from '../../genericComponents/Button';
import { PageFooterRow, ButtonCol, Pagination } from './SignUpFooterStyles';

const SignUpFooter: React.FC<{
  navigation: any;
  step: any;
  steps: any;
}> = ({ navigation, step, steps }) => {
  const { next, previous } = navigation;
  const showBackButton = step !== ('training' as any);
  const stepIndex = steps.findIndex((s: any) => s.id === (step as any));
  const showContinueButton = step !== ('awards' as any);

  return (
    <PageFooterRow>
      <Col lg="4">
        {showBackButton && (
          <Button
            onClick={previous}
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
        {showContinueButton && (
          <Button
            onClick={next}
            text="Continue"
            type="button"
            variant="primary"
          />
        )}
        {!showContinueButton && (
          <Button
            onClick={next}
            text="Go to Profile"
            type="button"
            variant="primary"
          />
        )}
      </ButtonCol>
    </PageFooterRow>
  );
};

export default SignUpFooter;
