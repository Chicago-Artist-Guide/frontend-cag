import React from 'react';
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import { Tagline, Title } from '../components/layout/Titles';

const TheaterResources = () => {
  return (
    <PageContainer>
      <Row>
        <Col lg={8}>
          <Title>THEATER RESOURCES</Title>
          <Tagline>
            Our collection of useful links and resources for actors, directors,
            producers and crew. Do you have a resource you think belongs on this
            list? Add it to our list by clicking
            <Link to="https://docs.google.com/forms/d/e/1FAIpQLSedgQdb2xR0IAlLyY9gmqf6poR_9abnS_ceRTSx5EbnDKCIuQ/viewform?usp=sf_link">
              here
            </Link>
          </Tagline>
        </Col>
        <Col lg={4}></Col>
      </Row>
    </PageContainer>
  );
};

export default TheaterResources;
