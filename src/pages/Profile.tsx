import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '../genericComponents/Button';
import styled from 'styled-components';
import {
  Jewell,
  Moorman,
  Morris,
  Robasson,
  Walton,
  Zacks
} from '../images/who-we-are/operations'; //TODO: Replace with user images from profile
import {
  DetailsCard,
  PageContainer,
  PhotoContainer,
  ProfileCard,
  Tagline
} from '../components/layout';

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

  const about = [
    {
      id: 1,
      age: '25-29',
      height: "5'6",
      ethnicity: 'N/A',
      gender: 'NB',
      union: 'SAG',
      agency: 'none'
    }
  ];

  return (
    <PageContainer>
      <Tagline>Your Profile</Tagline>
      <Row style={{ columnGap: '1rem', flexWrap: 'nowrap' }}>
        <PhotoCol lg={4}>
          <Photos>
            <PhotoContainer photos={photos} />
            <Button>Edit Photos</Button>
          </Photos>
          <DetailsCard about={about} />
        </PhotoCol>
        <Col lg={8}>
          <ProfileCard />
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
      </Col>
    </Row>
    </PageContainer>
  );
};

const Photos = styled.div`
  width: 100%;
`;

const PhotoCol = styled(Col)`
  max-width: 425px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;

  .card {
    width: 100%;
  }
`;

export default Profile;
