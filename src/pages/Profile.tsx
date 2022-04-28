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

  const profile = [
    {
      id: 1,
      name: 'John Johnson',
      pronouns: 'he/him',
      titles: 'Actor, Singer',
      bio: 'Lorem ipsum',
      institution: 'University of Illinois',
      certification: 'BFA, Dance',
      description: 'Dancem ipsum',
      upTitle: 'Wicked',
      upDesc: 'Witchem ipsum',
      upCode: 'TICKETTOOZ',
      upWeb: 'www.tickettooz.com',
      skills: 'Dancing, Singing, Acting',
      credits:
        'John Johnson (2017), Custodian #2, The Antheum Theater, Chicago, IL, Website: website, Director: That Guy, Musical Director: That Gal, Recognition: That Thing',
      awards: 'Best Actor, Best Actress'
    }
  ];

  return (
    <PageContainer>
      <Tagline>Your Profile</Tagline>
      <Row style={{ columnGap: '1rem', flexWrap: 'nowrap' }}>
        <PhotoCol lg={4}>
          <Photos>
            <PhotoContainer photos={photos} />
            <Button>EDIT MODE: Edit Photos button</Button>
          </Photos>
          <DetailsCard about={about} />
          <Button>EDIT MODE: Edit Identity Details button</Button>
        </PhotoCol>
        <Col lg={8}>
          <Button>EDIT MODE: Save Profile button</Button>
          <ProfileCard profile={profile} />
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
  justify-content: center;
  align-items: center;

  .card {
    width: 100%;
  }
`;

export default Profile;
