import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import { Tagline, Title } from '../components/layout/Titles';
import SVGLayer from '../components/SVGLayer';
import blueBlob from '../images/blue_blob.svg';
import streamingDance from '../images/streaming_dance.svg';

const TheaterResources = () => {
  return (
    <PageContainer>
      <Row>
        <Col lg={8}>
          <Title>THEATER RESOURCES</Title>
          <Tagline>Helpful Resources</Tagline>
          <p className="margin-container">
            Our collection of useful links and resources for actors, directors,
            producers and crew. Do you have a resource you think belongs on this
            list? Add it to our list by clicking
            <a href="https://forms.gle/eCHjeDGphFBr7y4W6"> here </a>
            or fill out the form below:
          </p>
          <iframe
            frameBorder="0"
            height="300px"
            name="resources"
            scrolling="yes"
            seamless
            src="https://docs.google.com/forms/d/e/1FAIpQLSedgQdb2xR0IAlLyY9gmqf6poR_9abnS_ceRTSx5EbnDKCIuQ/viewform?embedded=true"
            title="Submit and View Links to Theater Resources"
            width="100%"
          />
        </Col>
        <Col lg={4}>
          <SVGLayer blob={blueBlob} dancer={streamingDance} />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default TheaterResources;
