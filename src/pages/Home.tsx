import React from 'react';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import { Tagline, Title, TitleThree } from '../components/layout/Titles';
import WhoSquare from '../components/Home/WhoSquare';
import SVGLayer from '../components/SVGLayer';
import Mailchimp from '../components/Home/Mailchimp';
import yellowBlob1 from '../images/yellow_blob_1.svg';
import homeDance from '../images/home_dance.svg';
import greenBlob from '../images/green_blob.svg';
import dance1 from '../images/wwww-1.svg';
import redBlob from '../images/red_blob.svg';
import dance2 from '../images/wwww-2.svg';
import blueBlob1 from '../images/blue_blob.svg';
import dance3 from '../images/wwww-3.svg';

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
<<<<<<< HEAD
    <>
      <BlobBox blobs={blobs} />
      <PageContainer>
        <HomeRow>
          <Col lg={8}>
            <Title>CHICAGO ARTIST GUIDE</Title>
            <Tagline>Diversifying theater one connection at a time.</Tagline>
            <Nav.Link as={StartButton} to="/donate">
              DONATE
            </Nav.Link>
          </Col>
        </HomeRow>
        <ForArtists />
        <ForTheatres />
        <Mailchimp />
      </PageContainer>
    </>
=======
    <PageContainer>
      <Row>
        <Col lg={8}>
          <Title>CHICAGO ARTIST GUIDE</Title>
          <Tagline>We make connections. You make art.</Tagline>
          <TitleThree>WHAT WE DO</TitleThree>
          <p className="margin-container">
            We provide affordable and free tools to help diversify theatre in
            Chicago.
          </p>
        </Col>
        <Col lg={4}>
          <SVGLayer blob={yellowBlob1} dancer={homeDance} />
        </Col>
      </Row>
      <TitleThree className="margin-top">WHO WE WORK WITH</TitleThree>
      <Row>
        {whoWeWorkWith.map(who => (
          <MarginCol key={who.id} lg={true}>
            <WhoSquare
              blob={who.blob}
              dancer={who.dancer}
              points={who.points}
              title={who.title}
            />
          </MarginCol>
        ))}
      </Row>
      <Row>
        <Col lg={12}>
          <Mailchimp />
        </Col>
      </Row>
    </PageContainer>
>>>>>>> cf386f2 (Add mailchimp component)
  );
};

const StartButton = styled(Link)`
  color: white;
  height: 40px;
  width: 151px;
  display: flex;
  background: ${colors.slate};
  border: 0;
  border-radius: 20px;
  align-items: center;
  justify-content: center;

  &:hover {
    color: white;
    background: ${colors.slate}95;
  }

  .nav-link {
    color: white;
    flex-shrink: 0;
  }
`;

const HomeRow = styled(Row)`
  position: relative;

  @media (min-width: 768px) {
    height: 30rem;
  }
`;

export default Home;
