import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useHistory } from 'react-router-dom';
import { useAuthValue } from '../context/AuthContext';
import PageContainer from '../components/layout/PageContainer';
import AccountType from '../components/SignUp/AccountType';
import CompanySignUp from '../components/SignUp/Company';
import IndividualSignUp from '../components/SignUp/Individual';
import {
  ButtonCol,
  PageFooterRow
} from '../components/SignUp/SignUpFooterStyles';
import Button from '../genericComponents/Button';

const SignUp: React.FC = () => {
  const history = useHistory();
  const { currentUser } = useAuthValue();
  const [currentStep, setCurrentStep] = useState(-1);
  const [accountType, setAccountType] = useState<
    'individual' | 'company' | null
  >(null);

  useEffect(() => {
    if (currentUser && currentStep === -1) {
      history.push('/profile');
    }
  }, [currentUser]);

  if (currentStep === -1) {
    return (
      <PageContainer>
        <Row>
          <Col lg={12}>
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

export default SignUp;
