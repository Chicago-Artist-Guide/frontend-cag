import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import { NavigationProps, Step } from 'react-hooks-helper';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/shared/Button';
import { goToTop } from '../../../utils/goToTop';
import { ButtonCol, PageFooterRow, Pagination } from '../SignUpFooterStyles';

const SignUp2Footer: React.FC<{
  navigation: NavigationProps;
  step: any;
  steps: Step[];
  currentStep: string;
  submitSignUp2Profile: () => Promise<void>;
}> = ({ navigation, step, steps, currentStep, submitSignUp2Profile }) => {
  const navigate = useNavigate();
  const { next, previous } = navigation;
  const [nextBtnText, setNextBtnText] = useState<string>('Continue');
  const showBackButton = currentStep !== 'training';
  const stepIndex = steps.findIndex((s: any) => s.id === (step as any).id);

  useEffect(() => {
    if (currentStep === 'awards') {
      setNextBtnText('Go to Profile');
    } else {
      setNextBtnText('Continue');
    }
  }, [currentStep]);

  const nextButtonAction = async (currStep: string) => {
    if (currStep === 'awards') {
      await submitSignUp2Profile();
      navigate('/profile');
      goToTop();
      return;
    }

    goToTop();
    return next();
  };

  return (
    <PageFooterRow>
      <Col lg="4">
        {showBackButton && (
          <Button
            onClick={() => {
              goToTop();
              previous && previous();
            }}
            text="Back"
            type="button"
            variant="secondary"
          />
        )}
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
          onClick={() => nextButtonAction(currentStep)}
          text={nextBtnText}
          type="button"
          variant="primary"
        />
      </ButtonCol>
    </PageFooterRow>
  );
};

export default SignUp2Footer;
