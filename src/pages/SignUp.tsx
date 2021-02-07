import React, { useState } from 'react';
import { useForm, useStep } from 'react-hooks-helper';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
// import Landing from '../components/SignUp/Landing';
// import all of the step components up here

const steps = [
  { id: 'landing' },
  { id: 'basics' },
  { id: 'privacy' },
  { id: 'actorInfo1' },
  { id: 'actorInfo2' },
  { id: 'offstageRoles' },
  { id: 'profilePhoto' },
  { id: 'demographics' },
  { id: 'profilePreview' },
  { id: 'training' },
  { id: 'credits' },
  { id: 'upcoming' },
  { id: 'additionalSkills' },
  { id: 'awards' }
];

const defaultData = {
  landingType: '',
  landingPerformType: '',

  basicsFirstName: '',
  basicsLastName: '',
  basicsEmailAddress: '',
  basicsPassword: '',
  basics18Plus: false,

  privacyAgreement: false,

  actorInfo1Pronounds: '',
  actorInfo1LGBTQ: '',
  actorInfo1Ethnicities: [],

  actorInfo2Height: [],
  actorInfo2AgeRanges: [],
  actorInfo2Gender: '',
  actorInfo2GenderRoles: [],
  actorInfo2GenderTransition: '',

  offstageRolesGeneral: [],
  offstageRolesProduction: [],
  offstageRolesScenic: [],
  offstageRolesLighting: [],
  offstageRolesSound: [],
  offstageRolesHairMakeupCostumes: [],

  profilePhotoUrl: '',

  demographicsUnionStatus: '',
  demographicsAgency: '',
  demographicsWebsites: [], // { url, type }
  demographicsBio: '',

  training: [], // { institution, locationCity, locationState, locationCountry, degree, yearStart, yearEnd, notes }

  credits: [], // { title, group, location, startDate, endDate, url, role, director, musicalDirector, recognition }

  upcoming: [], // { title, synopsis, industryCode, url, imageUrl }

  additionalSkillsCheckboxes: [],
  additionalSkillsManual: [],

  awards: [] // { title, year, url, description }
};

const SignUp = () => {
  const [formData, setForm] = useForm(defaultData);
  const { step, navigation } = useStep({ initialStep: 0, steps });
  const { id } = step;

  // what the basics component (step 2) does:
  // gets currentStep, setCurrentStep, profileData, setProfileData
  // on submit, it:
  //  - validates anything that's required (like 18+ agreement)
  //  - updates profileData using current profile data + changes (new step data)
  //  - updates currentStep
  // example of what this might look like:
  /*

    const [fields, setFields] = useState({ id: 'basics', ...profileData['flows'][0]['steps'][currentStep - 1] });
    const updateField = (fieldName, value) => setFields({ ...fields, fieldName: value });
    const onSubmit = () => {
      // make sure validations are good based on fields
      const newProfileData = { ...profileData };
      newProfileData['flows'][0]['steps'][currentStep - 1] = { ...fields };
      setProfileData(newProfileData);
      setCurrentStep(currentStep + 1);
    };

  */

  const stepFrame = () => {
    let returnStep;

    if (currentFlow === 1) {
      switch (currentStep) {
        case 2:
        // returnStep 2
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        // step 7
        case 1:
        default:
          returnStep = <></>; // <Landing currentStep={currentStep} setCurrentStep={setCurrentStep} />;
      }
    } else {
      switch (currentStep) {
        case 2:
        // returnStep 2
        case 3:
        case 4:
        case 5:
        case 1:
        default:
          returnStep = <></>; // <Training currentStep={currentStep} setCurrentStep={setCurrentStep} />;
      }
    }

    return returnStep;
  };

  return (
    <PageContainer>
      <Row>
        <Col lg={8}>{stepFrame()}</Col>
      </Row>
    </PageContainer>
  );
};

export default SignUp;
