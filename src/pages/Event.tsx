import React from 'react';
import { BlobBox, PageContainer, Tagline, Title } from '../components/layout';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';
import { Button as BSButton } from 'react-bootstrap';

import Poster from '../images/events/cag-baret.png';
import { redBlob2, redBlob3, yellowBlob1, yellowBlob3 } from '../images';
import { breakpoints, colors, fonts } from '../theme/styleVars';

const event: Event = {
  title: 'A night at the Cag-baret',
  tagline: 'Launch Part Fundraiser'
};

type Event = {
  title: string;
  tagline: string;
};

const blobs = [
  {
    id: 2,
    blob: redBlob2,
    opacity: 1,
    transform: 'scale(1.0)',
    translate: '-5rem, 10rem'
  },
  {
    id: 3,
    blob: yellowBlob3,
    opacity: 1,
    transform: 'scale(1.0)',
    translate: '10rem, 20rem'
  },
  {
    id: 4,
    blob: yellowBlob1,
    opacity: 1,
    transform: 'scale(.8)',
    translate: '-15rem, 140rem'
  },
  {
    id: 5,
    blob: redBlob3,
    opacity: 1,
    transform: 'scale(.8)',
    translate: '15rem, 250rem'
  }
];

const EventPage = () => {
  return (
    <>
      <BlobBox blobs={blobs} />
      <PageContainer>
        <Row>
          <Col>
            <Title>{event.title}</Title>
            <Tagline>{event.tagline}</Tagline>
            <div style={{ textAlign: 'center', paddingTop: 45 }}>
              <Image
                src={Poster}
                alt="A night at the CAG-baret"
                height={1114}
              />
              <div id="tickets" style={{ paddingTop: 50 }}>
                <iframe
                  height={1150}
                  allowTransparency
                  allow="payment"
                  frameBorder="0"
                  scrolling="no"
                  style={{ width: 788, border: 'none', overflow: 'hidden' }}
                  src="https://secure.lglforms.com/form_engine/s/Ggqb-vmkrb6sWyeyD-TL9Q"
                >
                  <a href="https://secure.lglforms.com/form_engine/s/Ggqb-vmkrb6sWyeyD-TL9Q">
                    Fill out my LGL Form!
                  </a>
                </iframe>
              </div>
            </div>
            <Card>
              <DividerBar />
              <CardTitle>Come Celebrate With Us!</CardTitle>
              <CardDetail>
                Join us for{' '}
                <span style={{ fontWeight: 900, color: colors.black }}>
                  A Night At The CAG-baret
                </span>{' '}
                as we celebrate the upcoming release of our platform! We'll have
                drinks, music and a silent auction - so come and enjoy a night
                with us, and help support our efforts at making Chicago theatre
                more diverse, equitable and inclusive.
              </CardDetail>
            </Card>
            <InfoPanel
              title="What"
              detail="A Night at the CAG-Baret Fundraiser"
            />
            <InfoPanel title="When" detail="July 16, 2023 at 7:30 PM" />
            <InfoPanel
              title="Where"
              detail="Chicago Children's Theater, 100 S Racine Ave, Chicago, IL 60607"
            />
            <InfoPanel
              title="Who"
              detail="Hosted by Alexandria Moorman & the CAG Artist Auxiliary Board"
            />
            <InfoPanel
              title="Transportation Info"
              detail={
                <a href="https://chicagochildrenstheatre.org/plan-your-visit/">
                  https://chicagochildrenstheatre.org/plan-your-visit/
                </a>
              }
            />
            <CelebrateDivider />
            <div style={{ textAlign: 'center' }}>
              <InfoTitle>Come celebrate with us!</InfoTitle>
              <Button href="#tickets">Buy Tickets</Button>
            </div>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

const Info = styled.div`
  margin: 75px 20px 0;
`;

const InfoPanel = ({
  title,
  detail
}: {
  title: string;
  detail: React.ReactNode;
}) => {
  return (
    <Info>
      <InfoBar />
      <InfoTitle>{title}</InfoTitle>
      <InfoDetail>{detail}</InfoDetail>
    </Info>
  );
};

const CelebrateDivider = styled.div`
  width: 850px;
  height: 8px;
  border-radius: 4px;
  margin: 75px auto 15px;
  background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);
`;

const InfoBar = styled.div`
  width: 250px;
  height: 8px;
  border-radius: 4px;
  margin: 12px auto;
  background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);
  @media (min-width: ${breakpoints.md}) {
    margin: 12px 0;
  }
`;

const InfoTitle = styled.h1`
  font-family: ${fonts.montserrat};
  font-weight: 700;
  font-size: 48px;
  color: ${colors.black};
  text-transform: uppercase;
  letter-spacing: 0.07em;
  line-height: 48px;
`;

const InfoDetail = styled.div`
  font-family: ${fonts.montserrat};
  font-weight: 500;
  font-size: 28px;
  color: ${colors.black};
  letter-spacing: 0.07em;
  line-height: 28px;
  padding-top: 5px;
`;

const DividerBar = styled.div`
  width: 250px;
  height: 8px;
  border-radius: 4px;
  margin: 12px auto;
  background-image: linear-gradient(270deg, #2f4550 0%, #82b29a 100%);
  @media (min-width: ${breakpoints.md}) {
    margin: 12px 0;
  }
`;

const Card = styled.div`
  margin-top: 55px;
  background: ${colors.white};
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  width: 1100px;
  margin: 55px auto 0;
  padding: 50px 50px;
`;

const CardTitle = styled.h2`
  font-family: ${fonts.montserrat};
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  text-transform: uppercase;
`;

const CardDetail = styled.div`
  padding-top: 25px;
  font-family: ${fonts.lora};
  font-style: italic;
  font-size: 35px;
  line-height: 48px;
  color: ${colors.slate};
  letter-spacing: 0.01em;
  font-weight: 400;
`;

const Button = styled(BSButton)`
  margin: 35px auto 0;
  border-radius: 43px;
  box-shadow: 0px 0px 8px 4px #0000000d;
  font-family: ${fonts.montserrat};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 12px 35px;
  text-align: center;
  text-transform: uppercase;
  background: ${colors.salmon};
`;

export default EventPage;
