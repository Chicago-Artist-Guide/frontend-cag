import React from 'react';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '../../genericComponents/Button';
import { colors } from '../../theme/styleVars';

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
