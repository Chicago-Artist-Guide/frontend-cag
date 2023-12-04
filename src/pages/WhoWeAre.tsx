import React from 'react';
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack';
import styled from 'styled-components';
import PageContainer from '../components/layout/PageContainer';
import Collapsible from '../components/layout/Collapsible';
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
      <Row>
        <Col>
          <Stack gap={5}>
            <PageTitle>ABOUT US</PageTitle>
            <AboutSection>
              <h2>Vision</h2>
              <p>Theatre for everyone, made by anyone.</p>
            </AboutSection>
            <AboutSection>
              <h2>Mission</h2>
              <p>
                To diversify Chicago theatre with a centralized online network
                for artists, producers, and community groups.
              </p>
              <p>
                Learn more about us on our <Link to="/faq">FAQ page</Link>.
              </p>
            </AboutSection>
            <MeetOurTeamTitle>Meet Our Team</MeetOurTeamTitle>
            <Collapsible
              sectionTitles={sectionTitles}
              subSections={bios}
              subContainer={Team}
            />
          </Stack>
        </Col>
      </Row>
    </PageContainer>
  );
};

const PageTitle = styled.h1`
  margin-bottom: 50px;
`;

const AboutSection = styled.div`
  margin-bottom: 33px;
`;

const MeetOurTeamTitle = styled.h2`
  margin-top: 50px;
`;

export default WhoWeAre;
