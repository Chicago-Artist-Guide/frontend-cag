import React from 'react';
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import PhotoRow from '../components/layout/PhotoRow';
import styled from 'styled-components';
import { Tagline } from '../components/layout/Titles';
import {
  Jewell,
  Moorman,
  Morris,
  Robasson,
  Walton,
  Zacks
} from '../images/who-we-are/operations'; //TODO: Replace with user images from profile

const Profile: React.FC<{
  previewMode?: boolean;
}> = ({ previewMode = false }) => {
  const photos = [
    {
      id: 1,
      src: Jewell,
      text: 'Ops: Jewell'
    },
    {
      id: 2,
      src: Moorman,
      text: 'Ops: Moorman'
    },
    {
      id: 3,
      src: Morris,
      text: 'Ops: Morris'
    },
    {
      id: 4,
      src: Robasson,
      text: 'Ops: Robasson'
    },
    {
      id: 5,
      src: Walton,
      text: 'Ops: Walton'
    },
    {
      id: 6,
      src: Zacks,
      text: 'Ops: Zacks'
    }
  ];

  return (
    <PageContainer>
      <Tagline>Your Profile</Tagline>
      <Row style={{ columnGap: '5rem', flexWrap: 'nowrap' }}>
        <Col lg={4}>
          <Photos>
            <PhotoRow photos={photos} />
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
  width: 100%;
`;

const Details = styled.div`
  margin-left: 136px;
`;

export default Profile;
