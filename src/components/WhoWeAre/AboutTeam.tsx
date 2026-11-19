'use client';

import React from 'react';
import Collapsible from '../layout/Collapsible';
import { type AboutPageContent } from './aboutPageContent';
import Team from './Team';

const AboutTeam = ({
  team,
  titles
}: Pick<AboutPageContent, 'team' | 'titles'>) => (
  <Collapsible
    grid={true}
    sectionTitles={titles}
    subContainer={Team}
    subSections={team}
  />
);

export default AboutTeam;
