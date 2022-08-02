import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Step, useForm, useStep } from 'react-hooks-helper';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useProfileContext } from '../../../context/ProfileContext';
import Profile from '../../../pages/Profile';
import PageContainer from '../../layout/PageContainer';
import Privacy from '../Privacy';
import SignUpFooter from '../SignUpFooter';
import ActorInfo1 from './ActorInfo1';
import ActorInfo2 from './ActorInfo2';
import IndividualBasics from './Basics';
import Demographics from './Demographics';
import OffstageRoles from './OffstageRoles';
import ProfilePhoto from './ProfilePhoto';
import IndividualRole from './Role';

const IndividualSignUp: React.FC<{
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

  // this large effect deals with conditional steps based on "roles" question
  // see Rules comment below for details
  useEffect(() => {
    let newSteps = [...steps];
    const { stageRole } = formData;
    const indexForOffstageRoles = newSteps.findIndex(
      nS => nS.id === 'offstageRoles'
    );
    const indexForActorInfo1 = newSteps.findIndex(nS => nS.id === 'actorInfo1');
    const indexForActorInfo2 = newSteps.findIndex(nS => nS.id === 'actorInfo2');

    // Rules for conditional steps:
    // a. If the user selects "on-stage" then they see actor info 2 but not offstage roles
    // b. If the user selects "off-stage" then they see offstage roles but not actor info 2
    // c. If the user selects "both-stage" then they see both actor info 2 and offstage roles
    switch (stageRole) {
      case 'on-stage':
        // if we can't find the index for the step to remove, the user probably just went back
        if (indexForOffstageRoles > -1) {
          newSteps.splice(indexForOffstageRoles, 1);
        }

        // if we can't find the step we need here, we need to re-add it
        if (indexForActorInfo2 === -1 && indexForActorInfo1 > -1) {
          newSteps.splice(indexForActorInfo1 + 1, 0, {
            id: 'actorInfo2'
          });
        }
        break;
      case 'off-stage':
        // if we can't find the index for the step to remove, the user probably just went back
        if (indexForActorInfo2 > -1) {
          newSteps.splice(indexForActorInfo2, 1);
        }

        // if we can't find the step we need here, we need to re-add it
        if (indexForOffstageRoles === -1 && indexForActorInfo1 > -1) {
          newSteps.splice(indexForActorInfo1 + 1, 0, {
            id: 'offstageRoles'
          });
        }
        break;
      default:
        // let's just restore all of the steps
        newSteps = steps;
        break;
    }

    // no need to change state if we have no changes to steps
    if (JSON.stringify(steps) !== JSON.stringify(newSteps)) {
      setSteps(newSteps);
    }
  }, [formData.stageRole]); // eslint-disable-line react-hooks/exhaustive-deps

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
      basics18Plus,
      stageRole
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

          const profileRef = await addDoc(
            collection(firebaseFirestore, 'profiles'),
            {
              uuid: userId,
              account_id: accountRef.id,
              stage_role: stageRole
            }
          );

          setAccountRef(accountRef);
          setProfileRef(profileRef);
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

  // based on which step we're on, return a different step component and pass it the props it needs
  const stepFrame = () => {
    // console.log('stepFrame', stepId);
    const props = { formData, setForm, navigation };
    let returnStep;

    switch (stepId) {
      case 'role':
        returnStep = <IndividualRole {...props} />;
        break;
      case 'basics':
        returnStep = (
          <IndividualBasics
            {...props}
            hasErrorCallback={setStepErrorsCallback}
          />
        );
        break;
      case 'privacy':
        returnStep = <Privacy {...props} />;
        break;
      case 'actorInfo1':
        returnStep = (
          <ActorInfo1 {...props} hasErrorCallback={setStepErrorsCallback} />
        );
        break;
      case 'actorInfo2':
        returnStep = (
          <ActorInfo2 {...props} hasErrorCallback={setStepErrorsCallback} />
        );
        break;
      case 'offstageRoles':
        returnStep = <OffstageRoles {...props} />;
        break;
      case 'profilePhoto':
        returnStep = <ProfilePhoto {...props} />;
        break;
      case 'demographics':
        returnStep = <Demographics {...props} />;
        break;
      case 'profilePreview':
        returnStep = <Profile previewMode={true} />;
        break;
      default:
        returnStep = <></>;
        break;
    }

    return returnStep;
  };

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
          currentStep={stepId}
          stepErrors={stepErrors}
          steps={steps}
          submitBasics={submitBasics}
        />
      )}
    </PageContainer>
  );
};
export default IndividualSignUp;

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
  { id: 'role' },
  { id: 'basics' },
  { id: 'privacy' },
  { id: 'actorInfo1' },
  { id: 'actorInfo2' },
  { id: 'offstageRoles' },
  { id: 'profilePhoto' },
  { id: 'demographics' },
  { id: 'profilePreview' }
];

const defaultData = {
  actorInfo1Ethnicities: [],
  actorInfo1LGBTQ: '',
  actorInfo1Pronouns: '',
  actorInfo1PronounsOther: '',
  actorInfo2AgeRanges: [],
  actorInfo2Gender: '',
  actorInfo2GenderRoles: [],
  actorInfo2GenderTransition: '',
  actorInfo2HeightFt: 0,
  actorInfo2HeightIn: 0,
  actorInfo2HeightNoAnswer: false,
  basics18Plus: false,
  basicsEmailAddress: '',
  basicsFirstName: '',
  basicsLastName: '',
  basicsPassword: '',
  basicsPasswordConfirm: '',
  demographicsAgency: '',
  demographicsBio: '',
  demographicsUnionStatus: '',
  demographicsUnionStatusOther: '',
  demographicsWebsites: [{ id: 1, url: '', websiteType: '' }], // { id, url, websiteType }
  offstageRolesGeneral: [],
  offstageRolesHairMakeupCostumes: [],
  offstageRolesLighting: [],
  offstageRolesProduction: [],
  offstageRolesScenicAndProperties: [],
  offstageRolesSound: [],
  privacyAgreement: false,
  profilePhotoUrl: '',
  stageRole: ''
};
