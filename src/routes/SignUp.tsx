import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import queryString from 'query-string';
import PageContainer from '../components/layout/PageContainer';
import AccountType from '../components/SignUp/AccountType';
import CompanySignUp from '../components/SignUp/Company';
import TheatreSignUpRequest from '../components/SignUp/Company/TheatreSignUpRequest';
import IndividualSignUp from '../components/SignUp/Individual';
import { AccountTypeOptions } from '../components/SignUp/types';
import { useUserContext } from '../context/UserContext';

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
        <ContentWrapper>
          <AccountType
            accountType={accountType}
            setAccountType={setAccountType}
            onCardClick={() => setCurrentStep(0)}
          />
        </ContentWrapper>
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

  return (
    <ErrorWrapper>
      <ErrorMessage>
        Something went wrong. Please refresh the page and try again.
      </ErrorMessage>
    </ErrorWrapper>
  );
};

export default SignUp;

const ContentWrapper = styled.div`
  max-width: 100%;
  margin: 0 auto;
`;

const ErrorWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  padding: 20px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  font-size: 1rem;
  color: #666;
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  border-left: 4px solid #e17b60;

  @media (min-width: 640px) {
    font-size: 1.125rem;
    padding: 32px;
  }
`;
