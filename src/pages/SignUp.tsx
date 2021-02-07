import React from 'react';
import { useForm, useStep } from 'react-hooks-helper';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
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
  landingPerformType: [],

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

  const stepFrame = () => {
    const props = { formData, setForm, navigation };
    let returnStep;

    switch (id) {
      case 'landing':
      case 'basics':
      case 'privacy':
      case 'actorInfo1':
      case 'actorInfo2':
      case 'offstageRoles':
      case 'profilePhoto':
      case 'demographics':
      case 'profilePreview':
      case 'training':
      case 'credits':
      case 'upcoming':
      case 'additionalSkills':
      case 'awards':
      default:
        returnStep = <></>;
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
