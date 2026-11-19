import Link from 'next/link';
import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import AboutFrame from '../components/WhoWeAre/AboutFrame';
import {
  type AboutPageContent,
  defaultAboutPageContent
} from '../components/WhoWeAre/aboutPageContent';
import AboutTeam from '../components/WhoWeAre/AboutTeam';

const WhoWeAre = ({
  content = defaultAboutPageContent
}: {
  content?: AboutPageContent;
}) => {
  return (
    <PageContainer>
      <AboutFrame className="max-w-full">
        <div className="header-section">
          <h1 className="page-title">ABOUT US</h1>
          <div className="divider-bar" />
        </div>

        <div className="about-section">
          <div className="vision-mission-wrapper">
            <div className="about-card">
              <h2 className="about-title">Vision</h2>
              <p className="about-text whitespace-pre-line">{content.vision}</p>
            </div>

            <div className="about-card">
              <h2 className="about-title">Mission</h2>
              <p className="about-text whitespace-pre-line">
                {content.mission}
              </p>
              <p className="about-text">
                Learn more about us on our{' '}
                <Link
                  className="font-semibold text-[#82b29a] no-underline hover:text-[#6fa086] hover:underline"
                  href="/faq"
                >
                  FAQ page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="team-section">
          <h2 className="meet-our-team-title">Meet Our Team</h2>
          <div className="w-[100%]">
            <AboutTeam team={content.team} titles={content.titles} />
          </div>
        </div>
      </AboutFrame>
    </PageContainer>
  );
};

export default WhoWeAre;
