import React from 'react';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import { media } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import FooterBg from '../../images/footer-background.png';
import Envelope from '../../images/icons-footer/email.png';
import Facebook from '../../images/icons-footer/social_facebook.png';
import Insta from '../../images/icons-footer/social_instagram.png';
import Linkedin from '../../images/icons-footer/social_linkedin.png';
import Medium from '../../images/icons-footer/social_medium.png';
import Twitter from '../../images/icons-footer/social_twitter.png';
import LogoSrc from '../../images/logoPlain.svg';

const Footer = () => (
  <FooterNavbar className="justify-content-center nav container" expand="sm">
    <div className="container mt-12">
      <Row className="flex flex-1 justify-center">
        <EdgeCols
          md={{ order: 1, span: 3 }}
          sm={{ order: 1, span: 4 }}
          xs={{ span: 5 }}
        >
          <Nav className="flex-column m-auto" fill>
            <Nav.Item>
              <Nav.Link as={Link} to="/">
                HOME
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/about-us">
                ABOUT US
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/donate">
                DONATE
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </EdgeCols>
        <MidCol
          md={{ order: 2, span: 4 }}
          sm={{ order: 3, span: 6 }}
          xs={{ order: 3, span: 12 }}
        >
          <div className="d-sm-none d-none d-md-block">
            <FooterCAGLogo alt="Chicago Artist Guide" src={LogoSrc} />
          </div>
          <Nav className="icon-list m-auto" fill>
            <Nav.Item>
              <Nav.Link href="http://www.facebook.com/chiartistguide">
                <FooterLogo src={Facebook} />
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="https://www.linkedin.com/company/chicago-artist-guide">
                <FooterLogo src={Linkedin} />
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="https://www.instagram.com/chiartistguide">
                <FooterLogo src={Insta} />
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="https://medium.com/chiartistguide">
                <FooterLogo src={Medium} />
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="mailto:contact@chicagoartistguide.org">
                <FooterLogo src={Envelope} />
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <CopyText>&copy; Chicago Artist Guide 2024</CopyText>
        </MidCol>
        <EdgeCols
          md={{ order: 3, span: 3 }}
          sm={{ order: 2, span: 4 }}
          xs={{ span: 5 }}
        >
          <Nav className="flex-column m-auto" fill>
            <Nav.Item>
              <Nav.Link as={Link} to="/faq">
                FAQ
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/shows">
                SHOWS
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/theatre-resources">
                THEATRE RESOURCES
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/terms-of-service">
                TERMS OF SERVICE
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/privacy-policy">
                PRIVACY POLICY
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </EdgeCols>
      </Row>
    </div>
  </FooterNavbar>
);

const FooterNavbar = styled(Navbar)`
  ${media.smaller`
    background-image: url(${FooterBg});
    background-position: top left -50px;
    background-repeat: no-repeat;
    background-size: 150% auto;
    min-height: 200px;
    padding-top: 50px;

    .navbar-nav.icon-list {
      flex: 1;
      flex-direction: row;
      justify-content: space-between;
      width: 75%;
    }
  `}
`;

const MidCol = styled(Col)`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const FooterCAGLogo = styled(Image)`
  display: block;
  height: 60px;
  width: 70px;
`;

const FooterLogo = styled(Image)`
  height: 30px;
  width: 30px;

  ${media.sm`
    height: 25px;
    width: 25px;
  `}
`;

const EdgeCols = styled(Col)`
  a {
    text-align: Left;
    font-size: 12px;
    padding: 5px 0;
  }
`;

const CopyText = styled.div`
  font-size: 10px;

  ${media.smaller`
    font-size: 9px;
  `}
`;

export default Footer;
