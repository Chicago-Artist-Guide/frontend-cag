import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Step, useForm, useStep } from 'react-hooks-helper';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useProfileContext } from '../../../context/ProfileContext';
import PageContainer from '../../layout/PageContainer';
import Privacy from '../Privacy';
import SignUpFooter from './SignUpFooter';
import CompanyBasics from './Basics';
import CompanyDetails from './Details';
import CompanyPhoto from './Photo';
import { FormValues, FormStep, SubmitResponse } from './types';
import { defaultSteps, defaultErrorState, defaultFormState } from './utils';

const CompanySignUp: React.FC<{
  currentStep: number;
  setCurrentStep: (x: number) => void;
}> = ({ currentStep, setCurrentStep }) => {
  const { firebaseAuth, firebaseFirestore } = useFirebaseContext();
  const { profile, setAccountRef, setProfileRef } = useProfileContext();
  const [formValues, setFormValue] = useForm<FormValues>(defaultFormState);
  const [submitError, setSubmitError] = useState<SubmitResponse | undefined>();
  const [stepErrors, setStepErrors] = useState(defaultErrorState);

  const { step, navigation } = useStep({
    initialStep: currentStep,
    steps: defaultSteps
  });
  const stepId = (step as Step).id as FormStep;

  const handleSubmitBasics: () => Promise<SubmitResponse> = async () => {
    try {
      setSubmitError(undefined);
      console.log('handleSubmitBasics', { formValues });

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
        theater_name: theatreName,
        privacy_agreement: true
      });

      const profile = await addDoc(collection(firebaseFirestore, 'profiles'), {
        uid: userId,
        account_id: account.id
      });

      setAccountRef(account);
      setProfileRef(profile);
    } catch (e) {
      console.error('Error adding document:', e);
      setSubmitError({
        ok: false,
        code: 'profile-creation-error'
      });
    }

    const resp = { ok: true };
    setSubmitError(resp);
    return resp;
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

  // callback function for updating if a step has errors
  // we pass this down in the "hasErrorCallback" prop for the step
  const setStepErrorsCallback = (step: string, hasErrors: boolean) => {
    console.log('setStepErrorsCallback', { step, hasErrors });
    const newStepErrorsObj = { ...stepErrors };
    if (step in newStepErrorsObj) {
      newStepErrorsObj[step] = hasErrors;
    }
    setStepErrors(newStepErrorsObj);
  };

  // based on which step we're on, return a different step component and pass it the props it needs
  const stepFrame = () => {
    const props = { formValues, setForm: setFormValue, navigation };
    switch (stepId) {
      case 'basics':
        return (
          <CompanyBasics
            {...props}
            setFormErrors={setStepErrors}
            formErrors={stepErrors}
            hasErrorCallback={setStepErrorsCallback}
          />
        );
      case 'privacy':
        return <Privacy {...props} formData={formValues} />;
      case 'details':
        return (
          <CompanyDetails
            {...props}
            setFormErrors={setStepErrors}
            formErrors={stepErrors}
            hasErrorCallback={setStepErrorsCallback}
          />
        );
      case 'photo':
        return (
          <CompanyPhoto
            {...props}
            setFormErrors={setStepErrors}
            formErrors={stepErrors}
            hasErrorCallback={setStepErrorsCallback}
          />
        );
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
