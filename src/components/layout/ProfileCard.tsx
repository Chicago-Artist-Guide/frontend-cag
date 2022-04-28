import React from 'react';
import styled from 'styled-components';
import { Card as BSCard } from 'react-bootstrap';
<<<<<<< HEAD
import {
  AdditionalSkills,
  Awards,
  Credits,
  IntroText,
  TrainingText,
  UpcomingPerformances
} from './ProfileDetails';

const ProfileCard = (props: any) => {
  return (
    <Details>
      <IntroText />
      <TrainingText />
      <UpcomingPerformances />
      <AdditionalSkills />
      <Credits />
      <Awards />
=======
import { Col, Row } from 'react-bootstrap';
//import { Link } from 'react-router-dom';
import Button from '../../genericComponents/Button';

const ProfileCard = (props: any) => {
  const { profile } = props;
  return (
    <Details>
      {profile.map((profile: any) => (
        <>
          <p>
            Name: {profile.name} pronouns: {profile.pronouns}
          </p>
          <br />
          Titles: {profile.titles}
          <Button>EDIT MODE: Edit Titles button</Button>
          <br />
          <Button>EDIT MODE: Add Production Titles button</Button>
          <br />
          Bio write-up: {profile.bio}
          <br />
          Training
          <br />
          Institution: {profile.institution}
          <br />
          Location - Degree/Certification: {profile.certification}
          <br />
          Description: {profile.description}
          <br />
          <Button>EDIT MODE: Add Training button</Button>
          <br />
          Upcoming Performances:
          <Row>
            <Col lg={3}>Poster image (left)</Col>
            <Col lg={6}>
              {profile.upTitle}
              <br />
              {profile.upDesc}
              <br />
              Industry Code: {profile.upCode}
              <br />
              Website: {profile.upWeb}
            </Col>
            <Button>EDIT MODE: Add Upcoming button</Button>
          </Row>
          Additional Skills: {profile.skills}
          <br />
          <Button>EDIT MODE: Add Additional Skills button</Button>
          <br />
          Credits: {profile.credits}
          <br />
          Name (date)
          <br />
          Theater
          <br />
          Location
          <br />
          Role
          <br />
          Website
          <br />
          Director
          <br />
          Musical Director
          <br />
          Recognition
          <br />
          <Button>EDIT MODE: Add Credits button</Button>
          <br />
          Awards & Recognitions: {profile.awards}
          <br />
          (card)Award Title
          <br />
          Award Role
          <br />
          <Button>EDIT MODE: Add Awards & Recognitions button</Button>
          <br />
        </>
      ))}
>>>>>>> a3c4c6e (Rough block out of additional profile information)
    </Details>
  );
};

const Details = styled(BSCard)`
  position: relative;
  right: 0.37%;
  bottom: 0.35%;
  border-radius: 8px;
  padding: 20px;
  background-color: #ffffff;
  blend-mode: pass-through;
  backdrop-filter: blur(15px);
  h3 {
    line-height: 26px;
    letter-spacing: 0.07em;
  }
`;

export default ProfileCard;
