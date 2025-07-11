import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import queryString from 'query-string';
import PageContainer from '../components/layout/PageContainer';
import { PreviewCard } from '../components/Profile/shared/styles';
import AccountType from '../components/SignUp/AccountType';
import CompanySignUp from '../components/SignUp/Company';
import TheatreSignUpRequest from '../components/SignUp/Company/TheatreSignUpRequest';
import IndividualSignUp from '../components/SignUp/Individual';
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
              onCardClick={() => setCurrentStep(0)}
            />
          </Col>
        </Row>
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
    // requiring theatre groups to request to signup first for screening

    return flag ? (
      <CompanySignUp
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
    ) : (
      <TheatreSignUpRequest />
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
