import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Step, useForm, useStep } from 'react-hooks-helper';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useProfileContext } from '../../../context/ProfileContext';
import PageContainer from '../../layout/PageContainer';
import Privacy from '../Privacy';
import SignUpFooter, { SubmitBasicsResp } from './SignUpFooter';
import CompanyBasics from './Basics';
import CompanyDetails from './Details';
import CompanyPhoto from './Photo';
import { CompanyFormData } from './types';

const CompanySignUp: React.FC<{
  currentStep: number;
  setCurrentStep: (x: number) => void;
}> = ({ currentStep, setCurrentStep }) => {
  const { firebaseAuth, firebaseFirestore } = useFirebaseContext();
  const {
    accountRef,
    profileRef,
    setAccountRef,
    setProfileRef
  } = useProfileContext();
  const [formData, setForm] = useForm<CompanyFormData>(defaultData); // useForm is an extension of React hooks to manage form state
  const [submitBasicsErr, setSubmitBasicsErr] = useState<
    SubmitBasicsResp | undefined
  >(undefined);

  console.log({ accountRef, profileRef });

  // default state for form validation error states per step
  const [stepErrors, setStepErrors] = useState(
    createDefaultStepErrorsObj(flatSteps(defaultSteps))
  );

  // defaults for our defaultSteps
  const { step, index, navigation } = useStep({
    initialStep: currentStep,
    steps: defaultSteps
  });
  const stepId = (step as Step).id;
  // we are just manually assuming they've agreed to this right now
  // remove once we clean this up
  const setPrivacyAgree = () => {
    const target = {
      name: 'privacyAgreement',
      value: true
    };
    setForm({ target });
  };

  // submit basics to Firebase, get response, set session
  const submitBasics: () => Promise<SubmitBasicsResp> = async () => {
    // we only get here if they've agreed to the privacy agreement
    setPrivacyAgree();
    setSubmitBasicsErr(undefined);

    console.log('Submit Basics', { formData });

    const {
      theatreName: basicsTheatreName,
      emailAddress: basicsEmailAddress,
      password: basicsPassword
    } = formData;

    await createUserWithEmailAndPassword(
      firebaseAuth,
      basicsEmailAddress,
      basicsPassword
    )
      .then(async res => {
        try {
          const userId = res.user.uid;
          const account = await addDoc(
            collection(firebaseFirestore, 'accounts'),
            {
              uid: userId,
              type: 'company',
              theater_name: basicsTheatreName,
              privacy_agreement: true
            }
          );

          const company = await addDoc(
            collection(firebaseFirestore, 'companies'),
            {
              uid: userId,
              account_id: account.id
            }
          );

          console.log('Company', { company });
          console.log('Account', { account });

          // store account and profile refs so we can update them later
          setAccountRef(account);
          setProfileRef(company);
        } catch (e) {
          console.error('Error adding document:', e);
          const resp = {
            ok: false,
            code: 'profile-creation-error'
          };
          setSubmitBasicsErr(resp);
        }
      })
      .catch(err => {
        console.log('Error creating user:', err);
        const resp = {
          ok: false,
          code: err.code ?? 'unknown-user-creation-error'
        };
        setSubmitBasicsErr(resp);
      });

    const resp = { ok: true };
    setSubmitBasicsErr(resp);
    return resp;
  };

  // callback function for updating if a step has errors
  // we pass this down in the "hasErrorCallback" prop for the step
  const setStepErrorsCallback = (step: string, hasErrors: boolean) => {
    const newStepErrorsObj = { ...stepErrors };
    if (step in newStepErrorsObj) {
      newStepErrorsObj[step] = hasErrors;
    }
    setStepErrors(newStepErrorsObj);
  };

  // based on which step we're on, return a different step component and pass it the props it needs
  const stepFrame = () => {
    const props = { formData, setForm, navigation };
    console.log({ stepId });
    switch (stepId) {
      case 'basics':
        return (
          <CompanyBasics
            {...props}
            setFormErrors={setStepErrors}
            formErrors={stepErrors}
            hasErrorCallback={setStepErrorsCallback}
            // submitBasicsErr={undefined}
          />
        );
      case 'privacy':
        return <Privacy {...props} />;
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

  console.log('SignUp Index', { stepId });

  // if no Landing type is selected or it's profile preview, don't show navigation yet
  const showSignUpFooter = stepId !== 'profilePreview';

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>{stepFrame()}</Col>
      </Row>
      {showSignUpFooter && (
        <SignUpFooter
          landingStep={index}
          navigation={navigation}
          setLandingStep={setCurrentStep}
          submitSignUpProfile={() => new Promise(resolve => null)}
          currentStep={stepId}
          stepErrors={stepErrors}
          steps={defaultSteps}
          submitBasics={submitBasics}
        />
      )}
    </PageContainer>
  );
};

export default CompanySignUp;

// default object to track a boolean true/false for which steps have form validation error states
const createDefaultStepErrorsObj = (stepNames: string[]) => {
  const stepErrorsObj: { [key: string]: boolean } = {};
  // default all of our steps to false
  // because the pages will update this themselves
  // when errors or empty req fields arise or exist
  stepNames.forEach((stepName: string) => {
    stepErrorsObj[stepName] = false;
  });

  return stepErrorsObj;
};

// // flatten our step id's into a single array
const flatSteps = (stepsArrObj: Step[]) => stepsArrObj.map(step => step.id);

const defaultSteps: Step[] = [
  { id: 'basics' },
  { id: 'details' },
  { id: 'privacy' },
  { id: 'photo' }
];

const defaultData = {
  theatreName: '',
  emailAddress: '',
  password: '',
  passwordConfirm: '',
  numberOfMembers: '',
  primaryContact: '',
  location: '',
  description: '',
  privacyAgreement: false,
  profilePhotoUrl: ''
};
