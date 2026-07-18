'use client';

import React, { type ReactNode } from 'react';
import { homeFAQ } from '../FAQ/homeFAQ';
import Collapsible from '../layout/Collapsible';

const sectionTitles = {
  about: 'What is Chicago Artist Guide (CAG)?',
  price: 'Is it Free?',
  profile: 'Who can make an Artist Profile?',
  jobs: 'How can my Theatre Company sign up to post jobs?',
  identity:
    'Will I be excluded from casting searches based on how I self-identify?'
};

interface HomeAnswerProps {
  answer: ReactNode;
  id: number;
}

const HomeAnswer = ({ answer, id }: HomeAnswerProps) => (
  <div key={id}>
    <p>{React.Children.toArray(answer)}</p>
  </div>
);

const HomeFaq = () => (
  <Collapsible
    grid={false}
    sectionTitles={sectionTitles}
    subContainer={HomeAnswer}
    subSections={homeFAQ}
  />
);

export default HomeFaq;
