import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';
import Facebook from '../../images/icons-footer/facebook-f-brands.svg';
import Linkedin from '../../images/icons-footer/linkedin-in-brands.svg';
import Envelope from '../../images/icons-footer/envelope-regular.svg';
import { ReactComponent as Logo } from '../../images/logoPlain.svg';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Footer = () => (
  <Navbar className="nav justify-content-md-center" sticky="bottom">
    <Row>
      <Col md={3}>
        <Nav.Link as={Link} to="/">
          HOME
        </Nav.Link>
        <Nav.Link as={Link} to="/who-we-are">
          WHO WE ARE
        </Nav.Link>
      </Col>
      <Col md={6}>
        <Row className="justify-content-md-center">
          <Navbar.Brand href="/">
            <Logo height="60px" width="70px" />
          </Navbar.Brand>
        </Row>
        <Row className="justify-content-center">
          <Nav.Link href="http://www.facebook.com/chiartistguide">
            <FooterLogo src={Facebook} />
          </Nav.Link>
          <Nav.Link href="http://www.facebook.com/chiartistguide">
            <FooterLogo src={Facebook} />
          </Nav.Link>
          <Nav.Link href="https://www.linkedin.com/company/chicago-artist-guide">
            <FooterLogo src={Linkedin} />
          </Nav.Link>
          <Nav.Link href="https://www.linkedin.com/company/chicago-artist-guide">
            <FooterLogo src={Linkedin} />
          </Nav.Link>
          <Nav.Link href="mailto:contact@chicagoartistguide.org">
            <FooterLogo src={Envelope} />
          </Nav.Link>
          <Nav.Link href="mailto:contact@chicagoartistguide.org">
            <FooterLogo src={Envelope} />
          </Nav.Link>
        </Row>
      </Col>
      <Col md={3}>
        <Nav.Link as={Link} to="/faq">
          FAQ
        </Nav.Link>
        <Nav.Link as={Link} to="/terms-of-service">
          TERMS OF SERVICE
        </Nav.Link>
      </Col>
    </Row>
  </Navbar>
);

const FooterLogo = styled(Image)`
  height: 15px;
  width: 15px;
`;

export default Footer;
