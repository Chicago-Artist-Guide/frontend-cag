import React from 'react';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
import PageContainer from '../components/layout/PageContainer';
import { Tagline, Title, TitleThree } from '../components/layout/Titles';
import SVGLayer from '../components/SVGLayer';
import homeDance from '../images/home_dance.svg';
import SponsorCallForCulture from '../images/sponsors/callForCulture.png';
import SponsorCliffLogo from '../images/sponsors/cliff.jpg';
import SponsorLawLynx from '../images/sponsors/lawlynx.jpg';
import SponsorLetsRoam from '../images/sponsors/lets_roam_logo_horizontal_v3.jpg';
import SponsorGios from '../images/sponsors/gios.jpg';
import yellowBlob1 from '../images/yellow_blob_1.svg';
import { breakpoints } from '../theme/styleVars';
import { zeffyUrl } from '../utils/marketing';

const Donate = () => {
  return (
    <PageContainer>
      <Row>
        <Col lg={8}>
          <Title>DONATE</Title>
          <Tagline>Support Us</Tagline>
          <p className="margin-container">
            Chicago Artist Guide is building an online platform that will
            connect theatres with artists and help them diversify their casting
            and hiring. Thank you for supporting our efforts to foster and
            support a more diversified Chicago theatre community!
          </p>
        </Col>
        <Col lg={4}>
          <SVGLayer blob={yellowBlob1} dancer={homeDance} />
        </Col>
      </Row>
      <Row>
        <Col lg="12">
          <TitleThree>Two Ways to Give</TitleThree>
          <Row>
            <Col lg="8">
              <p>
                <strong>1. Online:</strong>
              </p>
              <IFrame
                allowTransparency
                allow="payment"
                title="Donate to Chicago Artist Guide online. Donation form powered by Zeffy."
                style={{ width: '100%', border: 'none', height: '1960px' }}
                src={zeffyUrl}
              >
                <a href={zeffyUrl} target="_blank">
                  Click here to donate to CAG on Zeffy!
                </a>
              </IFrame>
            </Col>
            <Col lg="12">
              <br />
              <p>
                <strong>2. OR by mail:</strong>
              </p>
              <p>
                <em>Mail a check to:</em>
              </p>
              <p>
                Chicago Artist Guide
                <br />
                c/o Anna Schutz
                <br />
                4814 N Damen Ave 212
                <br />
                Chicago, IL 60625
              </p>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col lg="12">
          <p>
            <em>
              Chicago Artist Guide NFP is a 501(c)(3) and donations are tax
              deductible to the fullest extent of the law.
            </em>
          </p>
        </Col>
      </Row>
      <Row>
        <Col lg="12">
          <hr />
          <TitleThree>Thank You to Our Generous Supporters</TitleThree>
          <Row>
            <SponsorCol lg="3">
              <a href="https://www.letsroam.com/" target="_blank">
                <Image src={SponsorLetsRoam} fluid />
              </a>
            </SponsorCol>
            <SponsorCol lg="3">
              <a href="https://cliff-chicago.org/foundation/" target="_blank">
                <Image src={SponsorCliffLogo} fluid />
              </a>
            </SponsorCol>
            <SponsorCol lg="3">
              <a href="https://callforculture.com/" target="_blank">
                <Image src={SponsorCallForCulture} fluid />
              </a>
            </SponsorCol>
          </Row>
          <Row>
            <SponsorCol lg="3">
              <a href="https://thelynxverse.com/" target="_blank">
                <Image src={SponsorLawLynx} fluid />
              </a>
            </SponsorCol>
            <SponsorCol lg="3">
              <a href="https://giosbbqbarandgrill.com/" target="_blank">
                <Image src={SponsorGios} fluid />
              </a>
            </SponsorCol>
          </Row>
        </Col>
      </Row>
    </PageContainer>
  );
};

const IFrame = styled.iframe`
  height: 1620px;

  @media screen and (max-width: ${breakpoints.sm}) {
    height: 1740px;
  }
`;

const SponsorCol = styled(Col)`
  display: flex;
  justify-content: center;
  align-items: center;

  a {
    display: block;
  }
`;

export default Donate;
