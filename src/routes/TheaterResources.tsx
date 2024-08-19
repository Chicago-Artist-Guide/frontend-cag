import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
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
          <Tagline>Submit or view a resource!</Tagline>
          <p className="margin-container">
            Our collection of useful links and resources for actors, directors,
            producers and crew. Do you have a resource you think belongs on this
            list? Add it to our list by clicking
            <a href="https://forms.gle/eCHjeDGphFBr7y4W6"> here </a>
            or filling out the form below.
          </p>
          <ResourcesTable className="table">
            <thead>
              <tr>
                <th scope="col">Organization</th>
                <th scope="col">Description</th>
                <th scope="col">Category</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <a href="https://www.techsoup.org/"> Tech Soup (Mock)</a>
                </td>
                <td>
                  Discounts on software and technology for nonprofits from
                  leading brands
                </td>
                <td>Technology</td>
              </tr>
              <tr></tr>
              <tr></tr>
            </tbody>
          </ResourcesTable>
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

const ResourcesTable = styled.table`
  margin-bottom: 2em;
`;

export default TheaterResources;
