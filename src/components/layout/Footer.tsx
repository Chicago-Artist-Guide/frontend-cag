import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import LogoSrc from '../../images/logoPlain.svg';
import Facebook from '../../images/icons-footer/facebook-f-brands.svg';
import Linkedin from '../../images/icons-footer/linkedin-in-brands.svg';
import Envelope from '../../images/icons-footer/envelope-regular.svg';

const Footer = () => (
  <Navbar className="justify-content-center" expand="sm" sticky="bottom">
    <FooterContainer fluid>
      <Row>
        <Col lg="4">
          <Nav className="flex-column m-auto" fill>
            <Nav.Item>
              <Nav.Link as={Link} to="/">
                HOME
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/who-we-are">
                WHO WE ARE
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <MidCol lg="4">
          <FooterCAGLogo alt="Chicago Artist Guide" src={LogoSrc} />
          <Nav className="m-auto" fill>
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
              <Nav.Link href="mailto:contact@chicagoartistguide.org">
                <FooterLogo src={Envelope} />
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </MidCol>
        <Col lg="4">
          <Nav className="flex-column m-auto" fill>
            <Nav.Item>
              <Nav.Link as={Link} to="/faq">
                FAQ
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="#">
                DONATE
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Link} to="/terms-of-service">
                TERMS OF SERVICE
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
      </Row>
    </FooterContainer>
  </Navbar>
);

const FooterContainer = styled(Container)`
  .row {
    flex: 1;
  }
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
  height: 15px;
  width: 15px;
`;

export default Footer;
