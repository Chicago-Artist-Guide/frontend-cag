import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Step, useForm, useStep } from 'react-hooks-helper';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useMarketingContext } from '../../../context/MarketingContext';
import { useUserContext } from '../../../context/UserContext';
import { createAccount } from '../../../services/accounts/client';
import {
  createProfile,
  updateProfile
} from '../../../services/profiles/client';
import { submitLGLConstituent } from '../../../utils/marketing';
import PageContainer from '../../layout/PageContainer';
import CompanyBasics from './Basics';
import CompanyDetails from './Details';
import CompanyPrivacy from './Privacy';
import SignUpFooter from './SignUpFooter';
import { CompanyData, FormStep, SubmitResponse } from './types';
import { defaultErrorState, defaultFormState, defaultSteps } from './utils';

const stepComponents = {
  basics: CompanyBasics,
  privacy: CompanyPrivacy,
  details: CompanyDetails
};

const CompanySignUp: React.FC<
  React.PropsWithChildren<{
    currentStep: number;
    setCurrentStep: (x: number) => void;
  }>
> = ({ currentStep, setCurrentStep }) => {
  const { firebaseAuth } = useFirebaseContext();
  const { profile, setAccount, setProfile } = useUserContext();
  const { lglApiKey } = useMarketingContext();
  const [formValues, setFormValues] = useForm<CompanyData>(defaultFormState);
  const [stepErrors, setStepErrors] = useState(defaultErrorState);
  const [errors, setErrors] = useState({});

  const { step, navigation } = useStep({
    initialStep: currentStep,
    steps: defaultSteps
  });
  const stepId = (step as Step).id as FormStep;

  const handleSubmitBasics: () => Promise<SubmitResponse> = async () => {
    const { emailAddress, password, theatreName } = formValues;
    let userResponse;
    try {
      setErrors({});
      userResponse = await createUserWithEmailAndPassword(
        firebaseAuth,
        emailAddress,
        password
      );
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        emailAddress:
          'Email address already in use, please ensure you are using your theatre’s email address not your personal'
      }));
      return { ok: false };
    }

    try {
      const userId = userResponse.user.uid;
      const account = await createAccount({
        uid: userId,
        type: 'company',
        email: emailAddress,
        theater_name: theatreName,
        privacy_agreement: true
      });

      const createdProfile = await createProfile({
        uid: userId,
        account_id: account.id
      });

      setAccount(account);
      setProfile(createdProfile);

      // submit to marketing
      await submitLGLConstituent({
        api_key: lglApiKey,
        first_name: theatreName,
        last_name: '',
        email_address: emailAddress,
        account_type: 'company',
        org_name: theatreName
      });

      return { ok: true };
    } catch (e) {
      console.error('Error adding document:', e);
      return { ok: false };
    }
  };

  const completeSignUp = async () => {
    if (profile.id) {
      await updateProfile(profile.id, {
        theatre_name: formValues.theatreName,
        number_of_members: formValues.numberOfMembers,
        primary_contact: formValues.primaryContact,
        primary_contact_email: formValues.primaryContactEmail,
        location: formValues.location,
        description: formValues.description,
        profile_image_url: formValues.profilePhotoUrl,
        complete_profile: true
      });
    }
  };

  const setStepErrorsCallback = (
    currentStep: string = stepId,
    hasErrors: boolean
  ) => {
    if (stepErrors[currentStep] !== undefined) {
      setStepErrors((prev) => ({ ...prev, [currentStep]: hasErrors }));
    }
  };

  const props = {
    stepId,
    navigation,
    formValues,
    errors,
    setForm: setFormValues,
    setStepErrors: setStepErrorsCallback
  };

  const StepComponent = stepComponents[stepId];

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <StepComponent {...props} formData={formValues} />
        </Col>
      </Row>
      <SignUpFooter
        navigation={navigation}
        setLandingStep={setCurrentStep}
        formStep={stepId}
        stepErrors={stepErrors}
        steps={defaultSteps}
        setErrors={setErrors}
        submitBasics={handleSubmitBasics}
        completeSignUp={completeSignUp}
      />
    </PageContainer>
  );
};

export default CompanySignUp;
