import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PageContainer from '../components/layout/PageContainer';
import { PreviewCard } from '../components/Profile/shared/styles';
import Button from '../components/shared/Button';
import AccountType from '../components/SignUp/AccountType';
import CompanySignUp from '../components/SignUp/Company';
import IndividualSignUp from '../components/SignUp/Individual';
import {
  ButtonCol,
  PageFooterRow
} from '../components/SignUp/SignUpFooterStyles';
import { AccountTypeOptions } from '../components/SignUp/types';
import { useUserContext } from '../context/UserContext';
import { breakpoints } from '../theme/styleVars';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { flag } = queryString.parse(location.search);
  const { currentUser } = useUserContext();
  const [currentStep, setCurrentStep] = useState(-1);
  const [accountType, setAccountType] = useState<AccountTypeOptions | null>(
    null
  );

  useEffect(() => {
    if (currentUser && currentStep === -1) {
      navigate('/profile');
    }
  }, [currentUser]);

  if (currentStep === -1) {
    return (
      <PageContainer>
        <Row>
          <Col lg={12}>
            <MobileWarning>
              <h2>
                <FontAwesomeIcon
                  style={{ marginRight: '12px' }}
                  icon={faExclamationTriangle}
                />{' '}
                Mobile Sign-Up Not Supported
              </h2>
              <p>
                We've detected you're using a mobile device to sign up. It is
                suggested you use a desktop computer because this process has
                not been designed for an enjoyable mobile experience yet. Mobile
                sign-up is coming soon!
              </p>
            </MobileWarning>
            <AccountType
              accountType={accountType}
              setAccountType={setAccountType}
            />
          </Col>
        </Row>
        {accountType && (
          <PageFooterRow>
            <Col lg="2" />
            <Col lg="8" />
            <ButtonCol lg="2" offset={10}>
              <Button
                onClick={() => setCurrentStep(0)}
                text="Continue"
                type="button"
                variant="primary"
              />
            </ButtonCol>
          </PageFooterRow>
        )}
      </PageContainer>
    );
  }

  if (accountType === 'individual') {
    return (
      <IndividualSignUp
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
    );
  }

  if (accountType === 'company') {
    return (
      <CompanySignUp
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
    );
  }

  return <div>Something went wrong.</div>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MobileWarning = styled(PreviewCard as any)`
  display: block;

  @media (min-width: ${breakpoints.md}) {
    display: none;
  }
`;

export default SignUp;
