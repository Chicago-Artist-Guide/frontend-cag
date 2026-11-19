'use client';

import React from 'react';
import Collapsible from '../layout/Collapsible';
import { type AboutPageContent, sectionTitles } from './aboutPageContent';
import Team from './Team';

const AboutTeam = ({ team }: { team: AboutPageContent['team'] }) => (
  <Collapsible
    grid={true}
    sectionTitles={sectionTitles}
    subContainer={Team}
    subSections={team}
  />
);

export default AboutTeam;
