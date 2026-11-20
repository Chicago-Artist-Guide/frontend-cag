'use client';

import React from 'react';
import Collapsible from '../layout/Collapsible';
import { type AboutPageContent, toCollapsibleProps } from './aboutPageContent';
import Team from './Team';

const AboutTeam = ({ sections }: Pick<AboutPageContent, 'sections'>) => (
  <Collapsible
    grid={true}
    subContainer={Team}
    {...toCollapsibleProps(sections)}
  />
);

export default AboutTeam;
