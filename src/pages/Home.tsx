import React from 'react';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { colors } from '../theme/styleVars';
import Mailchimp from '../components/Home/Mailchimp';
import {
  BlobBox,
  ForArtists,
  ForTheatres,
  PageContainer,
  Tagline,
  Title
} from '../components/layout';
import { greenBlob, redBlob, yellowBlob1, yellowBlob2 } from '../images';

const Home = () => {
  const blobs = [
    {
      id: 1,
      blob: yellowBlob1,
      opacity: 0.85,
      transform: 'scale(0.6)',
      translate: '-35rem, -45rem'
    },
    {
      id: 2,
      blob: redBlob,
      opacity: 0.6,
      transform: 'scale(0.65)',
      translate: '-15rem, -30rem'
    },
    {
      id: 3,
      blob: greenBlob,
      opacity: 0.7,
      transform: 'scale(.5)',
      translate: '30rem, -35rem'
    },
    {
      id: 4,
      blob: yellowBlob2,
      opacity: 0.85,
      transform: 'rotate(-124.79deg) scale(0.5)',
      translate: '45rem, -25rem'
    }
  ];

  return (
    <>
      <BlobBox blobs={blobs} />
      <PageContainer>
        <HomeRow>
          <Col lg={8}>
            <Title>CHICAGO ARTIST GUIDE</Title>
            <Tagline>Diversifying theater one connection at a time.</Tagline>
            <StartButton>
              <Nav.Link as={Link} to="/login">
                GET STARTED
              </Nav.Link>
            </StartButton>
          </Col>
        </HomeRow>
        <ForArtists />
        <ForTheatres />
        <Mailchimp />
      </PageContainer>
    </>
  );
};

const StartButton = styled(Button)`
  height: 40px;
  width: 151px;
  display: flex;
  background: ${colors.slate};
  border: 0;
  border-radius: 20px;
  align-items: center;
  justify-content: center;

  .nav-link {
    color: white;
    flex-shrink: 0;
  }
`;

const HomeRow = styled(Row)`
  position: relative;
  height: 30rem;
`;

export default Home;
