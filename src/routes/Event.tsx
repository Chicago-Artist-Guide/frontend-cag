import React from 'react';
import { Button as BSButton, Image } from 'react-bootstrap';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';
import styled from 'styled-components';
import { BlobBox, PageContainer, Tagline, Title } from '../components/layout';

import { redBlob2, redBlob3, yellowBlob1, yellowBlob3 } from '../images';
import CagBaret from '../images/events/cag-baret.png';
import Group from '../images/icons-signup/group.svg';
import { breakpoints, colors, fonts } from '../theme/styleVars';

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
    translate: '-15rem, 125rem'
  },
  {
    id: 5,
    blob: redBlob3,
    opacity: 1,
    transform: 'scale(.8)',
    translate: '15rem, 200rem'
  }
];

const EventPage = () => {
  return (
    <>
      <BlobBox blobs={blobs} />
      <PageContainer>
        <Row>
          <Col>
            <Title>A night at the Cag-baret</Title>
            <Tagline>Launch Party Fundraiser</Tagline>
            <div style={{ textAlign: 'center', paddingTop: 45 }}>
              <Poster src={CagBaret} alt="A night at the CAG-baret" />
              <div id="tickets" style={{ paddingTop: 50 }}>
                <IFrame
                  allow="payment"
                  frameBorder="0"
                  src="https://secure.lglforms.com/form_engine/s/Ggqb-vmkrb6sWyeyD-TL9Q"
                >
                  <a href="https://secure.lglforms.com/form_engine/s/Ggqb-vmkrb6sWyeyD-TL9Q">
                    Fill out my LGL Form!
                  </a>
                </IFrame>
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
                <a
                  style={{ color: 'black' }}
                  href="https://chicagochildrenstheatre.org/plan-your-visit/"
                >
                  https://chicagochildrenstheatre.org/plan-your-visit/
                </a>
              }
            />

            <InfoRow>
              <Col lg="6" xs="12">
                <LeftInfoCard>
                  <Image alt="" src={Group} />
                  <InfoCardTitle>Program</InfoCardTitle>
                  <InfoCardDetail>
                    7:30-8pm <br />
                    Jazz Group led by Board Member <br />
                    Tommy Bradford
                  </InfoCardDetail>
                  <InfoCardDetail>
                    8-9pm <br />
                    Chicago Artists' Performances
                  </InfoCardDetail>
                  <InfoCardDetail>
                    7:30-9:30pm <br />
                    Silent Auction throughout the evening
                  </InfoCardDetail>
                </LeftInfoCard>
              </Col>
              <Col lg="6" xs="12">
                <RightInfoCard>
                  <Image alt="" src={Group} />
                  <InfoCardTitle>Ticket Pricing</InfoCardTitle>
                  <InfoCardDetail>
                    $30 includes one beverage* of your choice
                    <br />
                    *Beverage: soda, wine, water, beer
                  </InfoCardDetail>
                  <InfoCardDetail>
                    Additional beverages available for purchase Snacks, hors
                    d'oeuvres, apps will be provided
                  </InfoCardDetail>
                </RightInfoCard>
              </Col>
            </InfoRow>

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

const IFrame = styled.iframe`
  height: 750px;
  width: 700px;
  border: none;
  overflow: hidden;
  @media (max-width: ${breakpoints.md}) {
    width: auto;
    height: 950px;
  }
`;

const Poster = styled(Image)`
  height: 1000px;
  @media (max-width: ${breakpoints.md}) {
    height: 600px;
  }
  @media (max-width: ${breakpoints.sm}) {
    height: 500px;
  }
`;

const InfoRow = styled(Row)`
  margin: 55px auto;
  width: 850px;
`;

const LeftInfoCard = styled.div`
  max-height: 475px;
  width: 325px;
  border-radius: 8px;
  background-color: ${colors.white};
  box-shadow: 0px 0px 12px 3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(7.5px);
  border-radius: 8px;
  padding: 50px 30px;
  margin: 0 auto;

  @media (max-width: ${breakpoints.sm}) {
    margin: 25px 0 0;
  }
`;

const RightInfoCard = styled.div`
  margin: 150px auto 0;
  max-height: 475px;
  width: 325px;
  border-radius: 8px;
  background-color: ${colors.white};
  box-shadow: 0px 0px 12px 3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(7.5px);
  border-radius: 8px;
  padding: 50px 30px;

  @media (max-width: ${breakpoints.sm}) {
    margin: 75px 0 0;
  }
`;

const InfoCardTitle = styled.div`
  font-family: ${fonts.montserrat};
  font-weight: 500;
  font-size: 24px;
  line-height: 18px;
  letter-spacing: 0.07em;
  margin-top: 10px;
  margin-bottom: 25px;
  text-transform: uppercase;
`;

const InfoCardDetail = styled.div`
  margin-top: 15px;
  color: ${colors.black};
  font-weight: 400;
  font-family: ${fonts.mainFont};
  font-size: 16px;
  line-height: 22px;
`;

const CelebrateDivider = styled.div`
  width: 700px;
  height: 8px;
  border-radius: 4px;
  margin: 75px auto 15px;
  background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);
  @media (max-width: ${breakpoints.sm}) {
    width: 300px;
  }
`;

const Info = styled.div`
  margin: 60px 75px 0;
  @media (max-width: ${breakpoints.md}) {
    margin: 60px 10px 0;
  }
`;

const InfoBar = styled.div`
  width: 250px;
  height: 8px;
  border-radius: 4px;
  margin: 12px 0;
  background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);
  @media (min-width: ${breakpoints.md}) {
    margin: 12px 0;
  }
`;

const InfoTitle = styled.h1`
  font-family: ${fonts.montserrat};
  font-weight: 700;
  font-size: 34px;
  color: ${colors.black};
  text-transform: uppercase;
  letter-spacing: 0.07em;
  line-height: 38px;
  @media (max-width: ${breakpoints.md}) {
    font-size: 32px;
  }
`;

const InfoDetail = styled.div`
  font-family: ${fonts.montserrat};
  font-weight: 500;
  font-size: 18px;
  color: ${colors.black};
  letter-spacing: 0.07em;
  line-height: 28px;
`;

const DividerBar = styled.div`
  width: 250px;
  height: 8px;
  border-radius: 4px;
  margin: 12px 0;
  background-image: linear-gradient(270deg, #2f4550 0%, #82b29a 100%);
`;

const Card = styled.div`
  margin-top: 55px;
  background: ${colors.white};
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  width: 1000px;
  margin: 55px auto 0;
  padding: 50px;

  @media (max-width: ${breakpoints.md}) {
    padding: 30px;
    width: 350px;
  }
`;

const CardTitle = styled.h2`
  font-family: ${fonts.montserrat};
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  text-transform: uppercase;
`;

const CardDetail = styled.div`
  padding-top: 15px;
  font-family: ${fonts.lora};
  font-style: italic;
  font-size: 28px;
  line-height: 38px;
  color: ${colors.slate};
  letter-spacing: 0.01em;
  font-weight: 400;

  @media (max-width: ${breakpoints.md}) {
    font-size: 22px;
  }
`;

const Button = styled(BSButton)`
  margin: 35px auto 0;
  border: none;
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
