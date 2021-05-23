import React from 'react';
// import { colors } from '../../theme/styleVars';
// import styled from 'styled-components';
import GenericAccordion from '../../genericComponents/Accordion';

const OffstageRoles = (...props: any) => {
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
    scenicAndProperties: ['abc'],
    lighting: ['def'],
    sound: ['ghi'],
    hairMakeupCostumes: ['jkl']
  };

  // const renderOffstageRoles = () => {
  //     return offstageRoles.map(offstageRolesItem => {
  //         return <GenericAccordion offstageRoleItem={offstageRolesItem} />
  //     })
  // }

  return (
    <div>
      <h1>SO, WHAT DO YOU LIKE DOING</h1>
      <h2>Tell us what positions suit you best</h2>
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
