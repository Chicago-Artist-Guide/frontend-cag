import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
import QandA from '../components/FAQ/QandA';
import { aboutQ } from '../components/FAQ/questions';
import Collapsible from '../components/layout/Collapsible';
import PageContainer from '../components/layout/PageContainer';
import { Tagline, Title } from '../components/layout/Titles';
import SVGLayer from '../components/SVGLayer';
import blueBlob from '../images/blue_blob.svg';
import streamingDance from '../images/streaming_dance.svg';

const FAQ = () => {
  const sectionTitles = {
    about: 'About Chicago Artist Guide',
    users: 'Our Users',
    platform: 'Our Platform',
    deiCommitment: 'Our DEI Commitment',
    privacy: 'Privacy'
  };

  return (
    <PageContainer>
      <Row>
        <Col lg={8}>
          <Title>FREQUENTLY ASKED QUESTIONS</Title>
          <Tagline>Find out what we're all about</Tagline>
          <Collapsible
            sectionTitles={sectionTitles}
            subSections={aboutQ}
            subContainer={QandA}
            grid={false}
          />
        </Col>
        <Col lg={4}>
          <HiddenIfMobile>
            <SVGLayer blob={blueBlob} dancer={streamingDance} />
          </HiddenIfMobile>
        </Col>
      </Row>
    </PageContainer>
  );
};

const HiddenIfMobile = styled.div`
  @media (max-width: 1024px) {
    display: none;
  }
`;

export default FAQ;
