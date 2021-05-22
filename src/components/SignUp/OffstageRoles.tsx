import React from 'react';
// import { colors } from '../../theme/styleVars';
// import styled from 'styled-components';
import Header from '../layout/Header';
import SignUpFooter from '../SignUp/SignUpFooter';
import Accordion from '../../genericComponents/Accordion';

const OffstageRoles = (...props: any) => {
  const {
    landingStep,
    landingType,
    navigation,
    setForm,
    setLandingStep,
    step,
    steps,
    offstageRolesGeneral,
    offstageRolesProduction,
    offstageRolesScenic,
    offstageRolesLighting,
    offstageRolesSound,
    offstageRolesHairMakeupCostumes
  } = props;

  const general = [
    'Directing',
    'Violence/Fight Design',
    'Intimacy Design',
    'Choreography',
    'Casting',
    'Dramaturgy',
    'Dialect Coaching',
    'Musical Directing'
  ];

  return (
    <div>
      <Header />
      <h1>SO, WHAT DO YOU LIKE DOING</h1>
      <h2>Tell us what positions suit you best</h2>
      <h3>Off-Stage Roles</h3>
      <h4>Select all applicable positions</h4>
      <Accordion
        General={offstageRolesGeneral}
        text={general}
        textHeader="General"
      />
      <Accordion Production={offstageRolesProduction} textHeader="Production" />
      <Accordion Scenic={offstageRolesScenic} textHeader="Scenic" />
      <Accordion Lighting={offstageRolesLighting} textHeader="Lighting" />
      <Accordion Sound={offstageRolesSound} textHeader="Sound" />
      <Accordion
        HairMakeupCostumes={offstageRolesHairMakeupCostumes}
        textHeader="HairMakeupCostumes"
      />
      <SignUpFooter
        landingStep={landingStep}
        landingType={landingType}
        navigation={navigation}
        setForm={setForm}
        setLandingStep={setLandingStep}
        step={step}
        steps={steps.offstageroles}
      />
    </div>
  );
};

export default OffstageRoles;
