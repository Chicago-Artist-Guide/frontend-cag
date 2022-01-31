import React from 'react';
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import styled from 'styled-components';
import { Tagline } from '../components/layout/Titles';

const Profile: React.FC<{
  previewMode?: boolean;
}> = ({ previewMode = false }) => {
  return (
    <PageContainer>
      <Tagline>Your Profile</Tagline>
      <Row>
        <Col lg={4}>
          <Photos>
            [Main Photo] <br />
            [Additional Photos 2x3]
            <Row>EDIT MODE: Edit Photos button</Row>
          </Photos>
          <Details>
            Age: [age]
            <br />
            Height: [height]
            <br />
            Ethnicity: [ethnicity]
            <br />
            Union: [union]
            <br />
            Gender: [gender]
            <br />
            Agency: [agency]
          </Details>
          <Row>EDIT MODE: Edit Identity Details button</Row>
        </Col>
        <Col lg={8}>
          <Row>EDIT MODE: Save Profile button</Row>
          Name, pronouns
          <br />
          Titles, EDIT MODE: Edit Titles button
          <br />
          EDIT MODE: Add Production Titles button
          <br />
          Bio write-up
          <br />
          (paragraphs)
          <br />
          Training
          <br />
          Institution
          <br />
          Location - Degree/Certification
          <br />
          Description
          <br />
          EDIT MODE: Add Training button
          <br />
          Upcoming Performances
          <Row>
            <Col lg={3}>Poster image (left)</Col>
            <Col lg={6}>
              Title(right)
              <br />
              Description
              <br />
              Industry Code
              <br />
              Website
            </Col>
            EDIT MODE: Add Upcoming button
          </Row>
          Additional Skills
          <br />
          (tags)
          <br />
          EDIT MODE: Add Additional Skills button
          <br />
          Credits
          <br />
          Name (date)
          <br />
          Theater
          <br />
          Location
          <br />
          Role
          <br />
          Website
          <br />
          Director
          <br />
          Musical Director
          <br />
          Recognition
          <br />
          EDIT MODE: Add Credits button
          <br />
          Awards & Recognitions
          <br />
          (card)Award Title
          <br />
          Award Role
          <br />
          EDIT MODE: Add Awards & Recognitions button
          <br />
          {previewMode && (
            <>
              <p>Preview Mode</p>
              <Link to="/sign-up-2">Continue to Sign Up 2</Link>
            </>
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

const Photos = styled.div`
  margin-bottom: 1rem;
`;

const Details = styled.div`
  margin-bottom: 1rem;
`;

export default Profile;
