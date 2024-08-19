import { updateDoc } from 'firebase/firestore';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Step, useForm, useStep } from 'react-hooks-helper';

import { PageContainer } from '../components/layout';
import AdditionalSkills from '../components/SignUp/Individual/AdditionalSkills';
import Awards from '../components/SignUp/Individual/Awards';
import Credits from '../components/SignUp/Individual/Credits';
import SignUp2Footer from '../components/SignUp/Individual/SignUp2Footer';
import Training from '../components/SignUp/Individual/Training';
import type {
  IndividualProfile2,
  IndividualProfile2Data
} from '../components/SignUp/Individual/types';
import Upcoming from '../components/SignUp/Individual/Upcoming';
import { useUserContext } from '../context/UserContext';

// Establish our steps
const steps: Step[] = [
  { id: 'training' },
  { id: 'credits' },
  { id: 'upcoming' },
  { id: 'additionalSkills' },
  { id: 'awards' }
];

// establish our form data structure
// assign defaults
const defaultData: IndividualProfile2Data = {
  trainingInstitutions: [
    {
      id: 1,
      trainingInstitution: '',
      trainingDegree: '',
      trainingYear: ''
    }
  ],

  pastPerformances: [
    {
      id: 1,
      title: '',
      year: '',
      group: '',
      role: '',
      director: '',
      musicalDirector: ''
    }
  ], // { title, group, location, startDate, endDate, url, role, director, musicalDirector, recognition }

  upcoming: [
    {
      id: 1,
      title: '',
      year: '',
      group: '',
      role: '',
      director: '',
      musicalDirector: ''
    }
  ], // { id, title, synopsis, industryCode, url, imageUrl }

  additionalSkillsCheckboxes: [],
  additionalSkillsManual: [],

  awards: [{ id: 1, title: '', year: '', url: '', description: '' }] // { id, title, year, url, description }
};

const SignUp2 = () => {
  const { profile } = useUserContext();
  const [formData, setForm] = useForm(defaultData); // useForm is an extension of React hooks to manage form state

  // defaults for our steps
  const { step, navigation } = useStep({ steps: steps });
  const stepId = (step as Step).id;

  // submit full sign up flow 2 profile data
  const submitSignUp2Profile = async () => {
    const {
      trainingInstitutions,
      pastPerformances, // { title, group, location, startDate, endDate, url, role, director, musicalDirector, recognition }
      upcoming, // { id, title, synopsis, industryCode, url, imageUrl }
      additionalSkillsCheckboxes,
      additionalSkillsManual,
      awards // { id, title, year, url, description }
    } = formData;

    const finalProfileData: IndividualProfile2 = {
      // training
      training_institutions: trainingInstitutions,

      // past perf
      past_performances: pastPerformances,

      // upcoming perf
      upcoming_performances: upcoming,

      // additional skills
      additional_skills_checkboxes: additionalSkillsCheckboxes,
      additional_skills_manual: additionalSkillsManual,

      // awards
      awards,

      // completed profile 2
      completed_profile_2: true
    };

    try {
      if (profile?.ref) {
        await updateDoc(profile.ref, { ...finalProfileData });
      } else {
        // no profileRef
        // look up?
      }
    } catch (err) {
      console.error('Error updating profile data:', err);
    }
  };

  // based on which step we're on, return a different step component and pass it the props it needs
  const stepFrame = () => {
    const props = { formData, setForm, navigation };
    let returnStep;

    switch (stepId) {
      case 'training':
        returnStep = <Training {...props} />;
        break;
      case 'credits':
        returnStep = <Credits {...props} />;
        break;
      case 'upcoming':
        returnStep = <Upcoming {...props} />;
        break;
      case 'additionalSkills':
        returnStep = <AdditionalSkills {...props} />;
        break;
      case 'awards':
        returnStep = <Awards {...props} />;
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
      <SignUp2Footer
        navigation={navigation}
        step={step}
        steps={steps}
        currentStep={stepId}
        submitSignUp2Profile={submitSignUp2Profile}
      />
    </PageContainer>
  );
};

export default SignUp2;
