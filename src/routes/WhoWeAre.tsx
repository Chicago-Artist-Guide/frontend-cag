import Link from 'next/link';
import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import AboutFrame from '../components/WhoWeAre/AboutFrame';
import AboutTeam from '../components/WhoWeAre/AboutTeam';

const WhoWeAre = () => {
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
              <p className="about-text">
                Theatre for everyone, made by anyone.
              </p>
            </div>

            <div className="about-card">
              <h2 className="about-title">Mission</h2>
              <p className="about-text">
                To diversify Chicago theatre with a centralized online network
                for artists, producers, and community groups.
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
            <AboutTeam />
          </div>
        </div>
      </AboutFrame>
    </PageContainer>
  );
};

export default WhoWeAre;
