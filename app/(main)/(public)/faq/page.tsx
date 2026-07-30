import Link from 'next/link';
import React from 'react';
import { aboutQ } from '../../../../src/components/FAQ/questions';
import PageContainer from '../../../../src/components/layout/PageContainer';
import { Tagline, Title } from '../../../../src/components/layout/Titles';
import SVGLayer from '../../../../src/components/SVGLayer';
import { blueBlob, streamingDance } from '../../../../src/config/publicImages';
import FaqAccordion, { type FaqSection } from './faq-accordion';

const sectionTitles = {
  about: 'About Chicago Artist Guide',
  users: 'Our Users',
  platform: 'Our Platform',
  deiCommitment: 'Our DEI Commitment',
  privacy: 'Privacy'
};

const internalHrefPaths: Record<string, string> = {
  'https://www.chicagoartistguide.org/about-us': '/about-us',
  'https://www.chicagoartistguide.org/donate': '/donate',
  'https://www.chicagoartistguide.org/terms-of-service': '/terms-of-service',
  '/privacy-policy': '/privacy-policy'
};

const renderAnswerPart = (part: React.ReactNode, index: number) => {
  if (
    !React.isValidElement<{ children?: React.ReactNode; href?: string }>(part)
  ) {
    return part;
  }

  const internalHref = part.props.href
    ? internalHrefPaths[part.props.href]
    : undefined;

  if (internalHref) {
    return (
      <Link href={internalHref} key={`answer-${index}`}>
        {part.props.children}
      </Link>
    );
  }

  return React.cloneElement(part, { key: `answer-${index}` });
};

const sections: FaqSection[] = (
  Object.keys(aboutQ) as Array<keyof typeof aboutQ>
).map((sectionId) => ({
  id: sectionId,
  title: sectionTitles[sectionId],
  content: aboutQ[sectionId].map((item) => (
    <div key={item.id}>
      <div className="mb-[2rem] mt-[1rem]">
        <div className="font-bold uppercase text-dark">{item.question}</div>
        {item.id === 16 ? (
          <div>{item.answer.map(renderAnswerPart)}</div>
        ) : (
          <p>{item.answer.map(renderAnswerPart)}</p>
        )}
      </div>
    </div>
  ))
}));

const FAQPage = () => (
  <PageContainer>
    <div className="row">
      <div className="col-lg-8">
        <Title>FREQUENTLY ASKED QUESTIONS</Title>
        <Tagline>Find out what we're all about</Tagline>
        <FaqAccordion sections={sections} />
      </div>
      <div className="col-lg-4">
        <div className="hidden min-[1025px]:block">
          <SVGLayer blob={blueBlob} dancer={streamingDance} />
        </div>
      </div>
    </div>
  </PageContainer>
);

export default FAQPage;
