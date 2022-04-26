import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useForm, useStep } from 'react-hooks-helper';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useAuthValue } from '../context/AuthContext';
import { useFirebaseContext } from '../context/FirebaseContext';
import PageContainer from '../components/layout/PageContainer';
import SignUpFooter from '../components/SignUp/SignUpFooter';
import Landing from '../components/SignUp/Landing';
import Privacy from '../components/SignUp/Privacy';
import Basics from '../components/SignUp/Basics';
import ActorInfo1 from '../components/SignUp/ActorInfo1';
import ActorInfo2 from '../components/SignUp/ActorInfo2';
import OffstageRoles from '../components/SignUp/OffstageRoles';
import ProfilePhoto from '../components/SignUp/ProfilePhoto';
import Demographics from '../components/SignUp/Demographics';
import Profile from '../pages/Profile';

// Establish our steps
const defaultSteps = [
  { id: 'landing' },
  { id: 'basics' },
  { id: 'privacy' },
  { id: 'actorInfo1' },
  { id: 'actorInfo2' },
  { id: 'offstageRoles' },
  { id: 'profilePhoto' },
  { id: 'demographics' },
  { id: 'profilePreview' }
];

// flatten our step id's into a single array
const flatSteps = (stepsArrObj: any) => stepsArrObj.map((step: any) => step.id);

// establish our form data structure
// assign defaults
const defaultData = {
  landingType: '',
  stageRole: '',

  basicsFirstName: '',
  basicsLastName: '',
  basicsEmailAddress: '',
  basicsPassword: '',
  basicsPasswordConfirm: '',
  basics18Plus: false,

  privacyAgreement: false,

  actorInfo1Pronouns: '',
  actorInfo1LGBTQ: '',
  actorInfo1Ethnicities: [],

  actorInfo2HeightFt: 0,
  actorInfo2HeightIn: 0,
  actorInfo2HeightNoAnswer: false,
  actorInfo2AgeRanges: [],
  actorInfo2Gender: '',
  actorInfo2GenderRoles: [],
  actorInfo2GenderTransition: '',

  offstageRolesGeneral: [],
  offstageRolesProduction: [],
  offstageRolesScenicAndProperties: [],
  offstageRolesLighting: [],
  offstageRolesSound: [],
  offstageRolesHairMakeupCostumes: [],

  profilePhotoUrl: '',

  demographicsUnionStatus: '',
  demographicsAgency: '',
  demographicsWebsites: [{ url: '', websiteType: '' }], // { url, websiteType }
  demographicsBio: ''
};

// default object to track a boolean true/false for which steps have form validation error states
const createDefaultStepErrorsObj = (stepNames: any) => {
  const stepErrorsObj: { [key: string]: boolean } = {};

  // default all of our steps to false
  // because the pages will update this themselves
  // when errors or empty req fields arise or exist
  stepNames.forEach((stepName: string) => {
    stepErrorsObj[stepName] = false;
  });

  return stepErrorsObj;
};

const SignUp = () => {
  const { currentUser } = useAuthValue();
  const { firebaseAuth, firebaseFirestore } = useFirebaseContext();
  const [formData, setForm] = useForm(defaultData); // useForm is an extension of React hooks to manage form state
  const [steps, setSteps] = useState(defaultSteps);
  const [landingStep, setLandingStep] = useState(1); // Landing has two defaultSteps internally, based on if "individual"

  // default state for form validation error states per step
  const [stepErrors, setStepErrors] = useState(
    createDefaultStepErrorsObj(flatSteps(steps))
  );

  // defaults for our defaultSteps
  const { step, navigation } = useStep({
    steps: flatSteps(steps) as any
  });

  // this large effect deals with conditional steps based on "roles" question
  // see Rules comment below for details
  useEffect(() => {
    let newSteps = [...steps];

    const { stageRole } = formData;
    const indexForOffstageRoles = newSteps.findIndex(
      nS => nS.id === 'offstageRoles'
    );
    const indexForActorInfo2 = newSteps.findIndex(nS => nS.id === 'actorInfo2');
    const indexForActorInfo1 = newSteps.findIndex(nS => nS.id === 'actorInfo1');

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
          newSteps.splice(indexForActorInfo1 + 1, 0, { id: 'actorInfo2' });
        }

        break;
      case 'off-stage':
        // if we can't find the index for the step to remove, the user probably just went back
        if (indexForActorInfo2 > -1) {
          newSteps.splice(indexForActorInfo2, 1);
        }

        // if we can't find the step we need here, we need to re-add it
        if (indexForOffstageRoles === -1 && indexForActorInfo1 > -1) {
          newSteps.splice(indexForActorInfo1 + 1, 0, { id: 'offstageRoles' });
        }

        break;
      default:
        // let's just restore all of the steps
        newSteps = defaultSteps;
        break;
    }

    // no need to change state if we have no changes to steps
    if (JSON.stringify(steps) !== JSON.stringify(newSteps)) {
      setSteps(newSteps);
    }
  }, [formData]); // eslint-disable-line react-hooks/exhaustive-deps

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

          await addDoc(collection(firebaseFirestore, 'accounts'), {
            basics_18_plus: basics18Plus,
            first_name: basicsFirstName,
            last_name: basicsLastName,
            privacy_agreement: true,
            uid: userId
          });
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
    const newStepErrorsObj = { ...stepErrors };

    if (step in newStepErrorsObj) {
      newStepErrorsObj[step] = hasErrors;
    }

    setStepErrors(newStepErrorsObj);
  };

  // based on which step we're on, return a different step component and pass it the props it needs
  const stepFrame = () => {
    const props = { formData, setForm, navigation };
    let returnStep;

    switch (step) {
      case 'landing' as any:
        returnStep = (
          <Landing
            {...props}
            landingStep={landingStep}
            setLandingStep={setLandingStep}
          />
        );
        break;
      case 'basics' as any:
        returnStep = (
          <Basics {...props} hasErrorCallback={setStepErrorsCallback} />
        );
        break;
      case 'privacy' as any:
        returnStep = <Privacy {...props} />;
        break;
      case 'actorInfo1' as any:
        returnStep = (
          <ActorInfo1 {...props} hasErrorCallback={setStepErrorsCallback} />
        );
        break;
      case 'actorInfo2' as any:
        returnStep = (
          <ActorInfo2 {...props} hasErrorCallback={setStepErrorsCallback} />
        );
        break;
      case 'offstageRoles' as any:
        returnStep = <OffstageRoles {...props} />;
        break;
      case 'profilePhoto' as any:
        returnStep = <ProfilePhoto {...props} />;
        break;
      case 'demographics' as any:
        returnStep = <Demographics {...props} />;
        break;
      case 'profilePreview' as any:
        returnStep = <Profile previewMode={true} />;
        break;
      default:
        returnStep = <></>;
        break;
    }

    return returnStep;
  };

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>{stepFrame()}</Col>
      </Row>
      {formData.landingType !== '' &&
      step !== ('profilePreview' as any) && ( // if no Landing type is selected or it's profile preview, don't show navigation yet
          <SignUpFooter
            landingStep={landingStep}
            landingType={formData.landingType}
            navigation={navigation}
            setLandingStep={setLandingStep}
            step={step}
            stepErrors={stepErrors}
            steps={steps}
            submitBasics={submitBasics}
          />
        )}
    </PageContainer>
  );
};

export default SignUp;
