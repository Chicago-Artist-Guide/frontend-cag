import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Step, useForm, useStep } from 'react-hooks-helper';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useProfileContext } from '../../../context/ProfileContext';
import PageContainer from '../../layout/PageContainer';
import Privacy from '../Privacy';
import CompanyBasics from './Basics';
import CompanyDetails from './Details';
import CompanyPhoto from './Photo';
import SignUpFooter from './SignUpFooter';
import { FormStep, CompanyData, SubmitResponse } from './types';
import { defaultErrorState, defaultFormState, defaultSteps } from './utils';

const CompanySignUp: React.FC<{
  currentStep: number;
  setCurrentStep: (x: number) => void;
}> = ({ currentStep, setCurrentStep }) => {
  const { firebaseAuth, firebaseFirestore } = useFirebaseContext();
  const { profile, setAccountRef, setProfileRef } = useProfileContext();
  const [formValues, setFormValues] = useForm<CompanyData>(defaultFormState);
  const [stepErrors, setStepErrors] = useState(defaultErrorState);
  const [steps, setSteps] = useState<Step[]>(defaultSteps);

  const { step, navigation } = useStep({
    initialStep: currentStep,
    steps: steps
  });
  const stepId = (step as Step).id as FormStep;

  const handleSubmitBasics: () => Promise<SubmitResponse> = async () => {
    try {
      const { emailAddress, password, theatreName } = formValues;
      const response = await createUserWithEmailAndPassword(
        firebaseAuth,
        emailAddress,
        password
      );
      const userId = response.user.uid;
      const account = await addDoc(collection(firebaseFirestore, 'accounts'), {
        uid: userId,
        type: 'company',
        email: emailAddress,
        theater_name: theatreName,
        privacy_agreement: true
      });

      const profile = await addDoc(collection(firebaseFirestore, 'profiles'), {
        uid: userId,
        account_id: account.id
      });

      setAccountRef(account);
      setProfileRef(profile);
      const nextSteps = steps.filter(s => s.id !== 'basics');
      setSteps(nextSteps);
    } catch (e) {
      console.error('Error adding document:', e);
    }
    return { ok: true };
  };

  const completeSignUp = async () => {
    if (profile.ref) {
      await updateDoc(profile.ref, {
        theatre_name: formValues.theatreName,
        number_of_members: formValues.numberOfMembers,
        primary_contact: formValues.primaryContact,
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
      setStepErrors(prev => ({ ...prev, [currentStep]: hasErrors }));
    }
  };

  const stepFrame = () => {
    const props = {
      stepId,
      navigation,
      formValues,
      setForm: setFormValues,
      setStepErrors: setStepErrorsCallback
    };
    switch (stepId) {
      case 'basics':
        return <CompanyBasics {...props} />;
      case 'privacy':
        return <Privacy {...props} formData={formValues} />;
      case 'details':
        return <CompanyDetails {...props} />;
      case 'photo':
        return <CompanyPhoto {...props} />;
      default:
        return <>Something went wrong</>;
    }
  };

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>{stepFrame()}</Col>
      </Row>
      <SignUpFooter
        navigation={navigation}
        setLandingStep={setCurrentStep}
        formStep={stepId}
        stepErrors={stepErrors}
        steps={defaultSteps}
        submitBasics={handleSubmitBasics}
        completeSignUp={completeSignUp}
      />
    </PageContainer>
  );
};

export default CompanySignUp;
