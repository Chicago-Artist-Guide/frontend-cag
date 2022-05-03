import React from 'react';
import styled from 'styled-components';
import { Card as BSCard } from 'react-bootstrap';
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
