import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Step, useForm, useStep } from 'react-hooks-helper';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useProfileContext } from '../../../context/ProfileContext';
import PageContainer from '../../layout/PageContainer';
import SignUpFooter from '../SignUpFooter';

const GroupSignUp: React.FC<{
  currentStep: number;
  setCurrentStep: (x: number) => void;
}> = ({ currentStep, setCurrentStep }) => {
  const { firebaseAuth, firebaseFirestore } = useFirebaseContext();
  const { setAccountRef, setProfileRef } = useProfileContext();
  const [formData, setForm] = useForm(defaultData); // useForm is an extension of React hooks to manage form state
  const [steps, setSteps] = useState<Step[]>(defaultSteps);

  // default state for form validation error states per step
  const [stepErrors, setStepErrors] = useState(
    createDefaultStepErrorsObj(flatSteps(steps))
  );

  // console.log('formData', { formData });
  // defaults for our defaultSteps
  const { step, index, navigation } = useStep({
    initialStep: currentStep,
    steps: steps
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
  const submitBasics = async () => {
    // we only get here if they've agreed to the privacy agreement
    setPrivacyAgree();

    const {
      basicsFirstName,
      basicsLastName,
      basicsEmailAddress,
      basicsPassword,
      basics18Plus
    } = formData;

    await createUserWithEmailAndPassword(
      firebaseAuth,
      basicsEmailAddress,
      basicsPassword
    )
      .then(async res => {
        try {
          const userId = res.user.uid;

          const accountRef = await addDoc(
            collection(firebaseFirestore, 'accounts'),
            {
              basics_18_plus: basics18Plus,
              first_name: basicsFirstName,
              last_name: basicsLastName,
              privacy_agreement: true,
              uid: userId
            }
          );

          // const profileRef = await addDoc(
          //   collection(firebaseFirestore, 'profiles'),
          //   {
          //     uuid: userId,
          //     account_id: accountRef.id,
          //     stage_role: stageRole
          //   }
          // );

          setAccountRef(accountRef);
          // setProfileRef(profileRef);
        } catch (e) {
          console.error('Error adding document:', e);
        }
      })
      .catch(err => {
        console.log('Error creating user:', err);
      });
  };

  // callback function for updating if a step has errors
  // we pass this down in the "hasErrorCallback" prop for the step
  const setStepErrorsCallback = (step: string, hasErrors: boolean) => {
    // console.log('step error', step, stepErrors);
    const newStepErrorsObj = { ...stepErrors };

    if (step in newStepErrorsObj) {
      newStepErrorsObj[step] = hasErrors;
    }

    setStepErrors(newStepErrorsObj);
  };

  // if no Landing type is selected or it's profile preview, don't show navigation yet
  const showSignUpFooter = stepId !== 'profilePreview';

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>{<div>Coming Soon</div>}</Col>
      </Row>
      {showSignUpFooter && (
        <SignUpFooter
          landingStep={index}
          navigation={navigation}
          setLandingStep={setCurrentStep}
          currentStep={stepId}
          stepErrors={stepErrors}
          steps={steps}
          submitBasics={submitBasics}
        />
      )}
    </PageContainer>
  );
};
export default GroupSignUp;

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

const defaultSteps: Step[] = [{ id: 'basics' }];

const defaultData = {
  basicsEmailAddress: '',
  basicsFirstName: '',
  basicsLastName: '',
  basicsPassword: '',
  basics18Plus: '',
  basicsPasswordConfirm: ''
};
