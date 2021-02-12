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

const Footer = () => (
  <Navbar className="nav justify-content-md-center" sticky="bottom">
    <div className="row justify-content-center">
      <div className="col">
        <Nav.Link as={Link} to="/">
          HOME
        </Nav.Link>
        <Nav.Link as={Link} to="/who-we-are">
          WHO WE ARE
        </Nav.Link>
      </div>
      <div className="col">
        <div className="row justify-content-center">
          <Navbar.Brand href="/">
            <Logo height="60px" width="70px" />
          </Navbar.Brand>
        </div>
        <div className="row">
          <div className="col-2">
            <Nav.Link href="http://www.facebook.com/chiartistguide">
              <FooterLogo src={Facebook} />
            </Nav.Link>
          </div>
          <div className="col-2">
            <Nav.Link href="http://www.facebook.com/chiartistguide">
              <FooterLogo src={Facebook} />
            </Nav.Link>
          </div>
          <div className="col-2">
            <Nav.Link href="https://www.linkedin.com/company/chicago-artist-guide">
              <FooterLogo src={Linkedin} />
            </Nav.Link>
          </div>
          <div className="col-2">
            <Nav.Link href="https://www.linkedin.com/company/chicago-artist-guide">
              <FooterLogo src={Linkedin} />
            </Nav.Link>
          </div>
          <div className="col-2">
            <Nav.Link href="mailto:contact@chicagoartistguide.org">
              <FooterLogo src={Envelope} />
            </Nav.Link>
          </div>
          <div className="col-2">
            <Nav.Link href="mailto:contact@chicagoartistguide.org">
              <FooterLogo src={Envelope} />
            </Nav.Link>
          </div>
        </div>
      </div>
      <div className="col">
        <Nav.Link as={Link} to="/faq">
          FAQ
        </Nav.Link>
        <Nav.Link as={Link} to="/terms-of-service">
          TERMS OF SERVICE
        </Nav.Link>
      </div>
    </div>
  </Navbar>
);

const FooterLogo = styled(Image)`
  height: 15px;
  width: 15px;
`;

export default Footer;
