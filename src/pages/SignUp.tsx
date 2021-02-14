import React from 'react';
import { useForm, useStep } from 'react-hooks-helper';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import PageContainer from '../components/layout/PageContainer';
import Landing from '../components/SignUp/Landing';
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

const flatSteps = steps.map(step => step.id);

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
  const { step, navigation } = useStep({ initialStep: 0, steps: flatSteps });

  const stepFrame = () => {
    const props = { formData, setForm, navigation };
    let returnStep;

    switch (step) {
      case 'landing' as any:
        returnStep = <Landing {...props} />;
        break;
      case 'basics' as any:
      case 'privacy' as any:
      case 'actorInfo1' as any:
      case 'actorInfo2' as any:
      case 'offstageRoles' as any:
      case 'profilePhoto' as any:
      case 'demographics' as any:
      case 'profilePreview' as any:
      case 'training' as any:
      case 'credits' as any:
      case 'upcoming' as any:
      case 'additionalSkills' as any:
      case 'awards' as any:
      default:
        returnStep = <></>;
        break;
    }

    return returnStep;
  };

  return (
    <PageContainer>
      <Row>
        <Col lg={8}>{stepFrame()}</Col>
      </Row>
      <Row>
        <Col lg="8">
          {step !== ('landing' as any) && (
            <Button
              onClick={navigation.previous}
              type="button"
              variant="secondary"
            >
              Back
            </Button>
          )}
          {step !== ('landing' as any) && step !== ('awards' as any) && (
            <Button onClick={navigation.next} type="button" variant="primary">
              Continue
            </Button>
          )}
        </Col>
      </Row>
      <Row>
        <Col lg="2" />
        <Col lg="8">
          <p>
            Step {steps.findIndex(s => s.id === (step as any)) + 1} of{' '}
            {steps.length}
          </p>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default SignUp;
