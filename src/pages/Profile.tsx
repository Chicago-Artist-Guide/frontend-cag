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
        <ImageCol lg="4">
          <Image alt="" src={yellow_blob} />
        </ImageCol>
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
