import React from 'react';
import { useForm, useStep } from 'react-hooks-helper';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import SignUp2Footer from '../components/SignUp/SignUp2Footer';
import Training from '../components/SignUp/Training';
import Credits from '../components/SignUp/Credits';
import Upcoming from '../components/SignUp/Upcoming';
import AdditionalSkills from '../components/SignUp/AdditionalSkills';
import Awards from '../components/SignUp/Awards';

// Establish our steps
const steps = [
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
  training: [], // { institution, locationCity, locationState, locationCountry, degree, yearStart, yearEnd, notes }

  pastPerformances: [], // { title, group, location, startDate, endDate, url, role, director, musicalDirector, recognition }

  upcoming: [
    { id: 1, title: '', synopsis: '', industryCode: '', url: '', imageUrl: '' }
  ], // { id, title, synopsis, industryCode, url, imageUrl }

  additionalSkillsCheckboxes: [],
  additionalSkillsManual: [],

  awards: [{ id: 1, title: '', year: '', url: '', description: '' }] // { id, title, year, url, description }
};

const SignUp2 = () => {
  const [formData, setForm] = useForm(defaultData); // useForm is an extension of React hooks to manage form state
  const { step, navigation } = useStep({ steps: flatSteps as any }); // defaults for our steps

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
      <SignUp2Footer navigation={navigation} step={step} steps={steps} />
    </PageContainer>
  );
};

export default SignUp2;
