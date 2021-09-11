import React, { useState } from 'react';
import { useForm, useStep } from 'react-hooks-helper';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
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
import { submitSignUpStep } from '../api/endpoints';
import { setSessionCookie } from '../utils/session';
import Performances from '../components/SignUp/PastPerformances';

// Establish our steps
const steps = [
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
const flatSteps = steps.map(step => step.id);

// establish our form data structure
// assign defaults
const defaultData = {
  landingType: '',
  landingPerformTypeOnStage: false,
  landingPerformTypeOffStage: false,

  basicsFirstName: '',
  basicsLastName: '',
  basicsEmailAddress: '',
  basicsPassword: '',
  basics18Plus: false,

  privacyAgreement: false,

  actorInfo1Pronounds: '',
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
  demographicsWebsites: [], // { url, type }
  demographicsBio: ''
};

const SignUp = () => {
  const [formData, setForm] = useForm(defaultData); // useForm is an extension of React hooks to manage form state
  const { step, navigation } = useStep({ steps: flatSteps as any }); // defaults for our steps
  const [landingStep, setLandingStep] = useState(1); // Landing has two steps internally, based on if "individual"

  const setPrivacyAgree = () => {
    const target = {
      name: 'privacyAgreement',
      value: true
    };

    setForm({ target });
  };

  const submitBasics = async () => {
    // set privacy agree even though it won't work for the payload yet
    setPrivacyAgree();

    const {
      basicsFirstName,
      basicsLastName,
      basicsEmailAddress,
      basicsPassword,
      basics18Plus
    } = formData;

    try {
      const getResp = await submitSignUpStep({
        basicsFirstName,
        basicsLastName,
        basicsEmailAddress,
        basicsPassword,
        basics18Plus,
        privacyAgreement: true // must be set manually for now
      });

      console.log(getResp);
      setSessionCookie({ ...getResp });
    } catch (err) {
      console.log(err);
    }
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
        returnStep = <Basics {...props} />;
        break;
      case 'privacy' as any:
        returnStep = <Privacy {...props} />;
        break;
      case 'actorInfo1' as any:
        returnStep = <ActorInfo1 {...props} />;
        break;
      case 'actorInfo2' as any:
        returnStep = <ActorInfo2 {...props} />;
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
            setForm={setForm}
            setLandingStep={setLandingStep}
            step={step}
            steps={steps}
            submitBasics={submitBasics}
          />
        )}
    </PageContainer>
  );
};

export default SignUp;
