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
//import { greenBlob, redBlob, yellowBlob1, yellowBlob2 } from '../images';

const Home = () => {
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
  height: 80vh;
`;

export default Home;
