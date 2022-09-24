import { updateDoc } from 'firebase/firestore';
import React from 'react';
import { Step, useForm, useStep } from 'react-hooks-helper';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useProfileContext } from '../context/ProfileContext';
import PageContainer from '../components/layout/PageContainer';
import SignUp2Footer from '../components/SignUp/SignUp2Footer';
import Training from '../components/SignUp/Individual/Training';
import Credits from '../components/SignUp/Individual/Credits';
import Upcoming from '../components/SignUp/Individual/Upcoming';
import AdditionalSkills from '../components/SignUp/Individual/AdditionalSkills';
import Awards from '../components/SignUp/Individual/Awards';

// Establish our steps
const steps: Step[] = [
  { id: 'training' },
  { id: 'credits' },
  { id: 'upcoming' },
  { id: 'additionalSkills' },
  { id: 'awards' }
];

// flatten our step id's into a single array
const flatSteps = steps.map(step => step.id);

// establish our form data structure
// assign defaults
const defaultData = {
  trainingInstitution: '',
  trainingCity: '',
  trainingState: '',
  trainingDegree: '',
  trainingDetails: '',

  pastPerformances: [
    {
      id: 1,
      title: '',
      group: '',
      location: '',
      startDate: '',
      endDate: '',
      url: '',
      role: '',
      director: '',
      musicalDirector: '',
      recognition: ''
    }
  ], // { title, group, location, startDate, endDate, url, role, director, musicalDirector, recognition }

  upcoming: [
    { id: 1, title: '', synopsis: '', industryCode: '', url: '', imageUrl: '' }
  ], // { id, title, synopsis, industryCode, url, imageUrl }

  additionalSkillsCheckboxes: [],
  additionalSkillsManual: [],

  awards: [{ id: 1, title: '', year: '', url: '', description: '' }] // { id, title, year, url, description }
};

const SignUp2 = () => {
  const { profileRef } = useProfileContext();
  const [formData, setForm] = useForm(defaultData); // useForm is an extension of React hooks to manage form state
  const { step, navigation } = useStep({ steps: flatSteps as any }); // defaults for our steps
  const stepId = (step as Step).id;

  console.log(formData);

  // submit full sign up flow 2 profile data
  const submitSignUp2Profile = async () => {
    const {
      trainingInstitution,
      trainingCity,
      trainingState,
      trainingDegree,
      trainingDetails,
      pastPerformances, // { title, group, location, startDate, endDate, url, role, director, musicalDirector, recognition }
      upcoming, // { id, title, synopsis, industryCode, url, imageUrl }
      additionalSkillsCheckboxes,
      additionalSkillsManual,
      awards // { id, title, year, url, description }
    } = formData;

    const finalProfileData = {
      // training
      training_institution: trainingInstitution,
      training_city: trainingCity,
      training_state: trainingState,
      training_degree: trainingDegree,
      training_details: trainingDetails,

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
      if (profileRef) {
        await updateDoc(profileRef, { ...finalProfileData });
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

    switch (step) {
      case 'training' as any:
        returnStep = <Training {...props} />;
        break;
      case 'credits' as any:
        returnStep = <Credits {...props} />;
        break;
      case 'upcoming' as any:
        returnStep = <Upcoming {...props} />;
        break;
      case 'additionalSkills' as any:
        returnStep = <AdditionalSkills {...props} />;
        break;
      case 'awards' as any:
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
