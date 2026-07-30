'use client';

import React from 'react';
import Collapsible from '../layout/Collapsible';
import bios from './bios';
import Team from './Team';

const sectionTitles = {
  board: 'BOARD OF DIRECTORS',
  artists: 'ARTIST AUXILIARY BOARD',
  operations: 'BUSINESS OPERATIONS',
  technical: 'SITE DEVELOPMENT',
  artistAdvisory: 'ADVISORY BOARD'
};

const AboutTeam = () => (
  <Collapsible
    grid={true}
    sectionTitles={sectionTitles}
    subContainer={Team}
    subSections={bios}
  />
);

export default AboutTeam;
