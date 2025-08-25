import React from 'react';
import styled from 'styled-components';
import Collapsible from '../components/layout/Collapsible';
import PageContainer from '../components/layout/PageContainer';
import bios from '../components/WhoWeAre/bios';
import Team from '../components/WhoWeAre/Team';

const WhoWeAre = () => {
  const sectionTitles = {
    board: 'BOARD OF DIRECTORS',
    artists: 'ARTIST AUXILIARY BOARD',
    operations: 'BUSINESS OPERATIONS',
    technical: 'SITE DEVELOPMENT',
    artistAdvisory: 'ADVISORY BOARD'
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <HeaderSection>
          <PageTitle>ABOUT US</PageTitle>
          <DividerBar />
        </HeaderSection>

        <AboutSection>
          <VisionMissionWrapper>
            <AboutCard>
              <AboutTitle>Vision</AboutTitle>
              <AboutText>Theatre for everyone, made by anyone.</AboutText>
            </AboutCard>

            <AboutCard>
              <AboutTitle>Mission</AboutTitle>
              <AboutText>
                To diversify Chicago theatre with a centralized online network
                for artists, producers, and community groups.
              </AboutText>
              <AboutText>
                Learn more about us on our{' '}
                <AboutLink href="/faq">FAQ page</AboutLink>.
              </AboutText>
            </AboutCard>
          </VisionMissionWrapper>
        </AboutSection>

        <TeamSection>
          <MeetOurTeamTitle>Meet Our Team</MeetOurTeamTitle>
          <CollapsibleWrapper>
            <Collapsible
              sectionTitles={sectionTitles}
              subSections={bios}
              subContainer={Team}
              grid={true}
            />
          </CollapsibleWrapper>
        </TeamSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default WhoWeAre;

const ContentWrapper = styled.div`
  max-width: 100%;
`;

const HeaderSection = styled.div`
  margin-bottom: 32px;
  text-align: center;

  @media (min-width: 768px) {
    margin-bottom: 48px;
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #2f4550;
  text-transform: uppercase;

  @media (min-width: 640px) {
    font-size: 2.5rem;
    margin-bottom: 32px;
  }

  @media (min-width: 768px) {
    font-size: 3rem;
    margin-bottom: 40px;
  }
`;

const DividerBar = styled.div`
  width: 100%;
  max-width: 200px;
  height: 3px;
  border-radius: 2px;
  margin: 0 auto;
  background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);

  @media (min-width: 640px) {
    max-width: 250px;
    height: 4px;
  }

  @media (min-width: 768px) {
    max-width: 300px;
  }
`;

const AboutSection = styled.div`
  margin-bottom: 48px;

  @media (min-width: 768px) {
    margin-bottom: 64px;
  }
`;

const VisionMissionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 32px;
  }

  @media (min-width: 1024px) {
    gap: 48px;
  }
`;

const AboutCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  flex: 1;

  @media (min-width: 640px) {
    padding: 32px;
  }

  @media (min-width: 768px) {
    padding: 36px;
  }
`;

const AboutTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #2f4550;

  @media (min-width: 640px) {
    font-size: 1.75rem;
    margin-bottom: 20px;
  }

  @media (min-width: 768px) {
    font-size: 2rem;
    margin-bottom: 24px;
  }
`;

const AboutText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: 640px) {
    font-size: 1.1rem;
    line-height: 1.7;
  }

  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
`;

const AboutLink = styled.a`
  color: #82b29a;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    color: #6fa086;
    text-decoration: underline;
  }
`;

const TeamSection = styled.div`
  margin-top: 48px;

  @media (min-width: 768px) {
    margin-top: 64px;
  }
`;

const MeetOurTeamTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 32px;
  color: #2f4550;
  text-align: center;

  @media (min-width: 640px) {
    font-size: 2rem;
    margin-bottom: 40px;
  }

  @media (min-width: 768px) {
    font-size: 2.25rem;
    margin-bottom: 48px;
    text-align: left;
  }
`;

const CollapsibleWrapper = styled.div`
  width: 100%;
`;
