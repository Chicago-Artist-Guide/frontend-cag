import React from 'react';
// import { colors } from '../../theme/styleVars';
// import styled from 'styled-components';
import GenericAccordion from '../../genericComponents/Accordion';

// create local state to monitor checkboxes and push values to arrays

const OffstageRoles = (...props: any) => {
  // const [general, setGeneral] = useState([]);
  // const [production, setProduction] = useState([]);
  // const [scenicAndProperties, setScenicAndProperties] = useState([]);
  // const [lighting, setLighting] = useState([]);
  // const [sound, setSound] = useState([]);
  // const [hairMakeupCostumes, setHairMakeupCostumes] = useState([]);

  const offstageRoles = {
    general: [
      'Directing',
      'Violence/Fight Design',
      'Intimacy Design',
      'Choreography',
      'Casting',
      'Dramaturgy',
      'Dialect Coaching',
      'Musical Directing'
    ],
    production: [
      'Stage Management',
      'Production Management',
      'Board Op',
      'Run Crew'
    ],
    scenicAndProperties: [
      'Set Design',
      'Technical Direction',
      'Properties Designer',
      'Scenic Carpentry',
      'Charge Artist'
    ],
    lighting: [
      'Lighting Design',
      'Projection Design',
      'Special Effects Design',
      'Master Electrician'
    ],
    sound: ['Sound Design', 'Sound Mixer/Engineer'],
    hairMakeupCostumes: [
      'Costume Design',
      'Hair & Wig Design',
      'Make-up Design'
    ]
  };

  return (
    <div>
      <h1>SO, WHAT DO YOU LIKE DOING?</h1>
      <h2>Tell us what positions suit you best.</h2>
      <h3>Off-Stage Roles</h3>
      <h4>Select all applicable positions</h4>
      <GenericAccordion text={offstageRoles.general} textHeader="General" />
      <GenericAccordion
        text={offstageRoles.production}
        textHeader="Production"
      />
      <GenericAccordion
        text={offstageRoles.scenicAndProperties}
        textHeader="Scenic"
      />
      <GenericAccordion text={offstageRoles.lighting} textHeader="Lighting" />
      <GenericAccordion text={offstageRoles.sound} textHeader="Sound" />
      <GenericAccordion
        text={offstageRoles.hairMakeupCostumes}
        textHeader="Hair/Makeup/Costumes"
      />
    </div>
  );
};

export default OffstageRoles;
