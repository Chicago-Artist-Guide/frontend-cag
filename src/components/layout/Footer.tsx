import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Image from "react-bootstrap/Image";
import Facebook from "../../images/icons-footer/facebook-f-brands.svg";
import Linkedin from "../../images/icons-footer/linkedin-in-brands.svg";
import Envelope from "../../images/icons-footer/envelope-regular.svg";

const Footer = () => (
  <Navbar className="nav" expand="sm" sticky="bottom">
    <Nav className="m-auto">
      <Nav.Link as={Link} to="/">
        HOME
      </Nav.Link>
      <Nav.Link as={Link} to="/who-we-are">
        WHO WE ARE
      </Nav.Link>
      <Nav.Link as={Link} to="/terms-of-service">
        TERMS OF SERVICE
      </Nav.Link>
      <Nav.Link as={Link} to="/faq">
        FAQ
      </Nav.Link>
      <Nav.Link href="http://www.facebook.com/chiartistguide">
        <FooterLogo src={Facebook} />
      </Nav.Link>
      <Nav.Link href="https://www.linkedin.com/company/chicago-artist-guide">
        <FooterLogo src={Linkedin} />
      </Nav.Link>
      <Nav.Link href="mailto:contact@chicagoartistguide.org">
        <FooterLogo src={Envelope} />
      </Nav.Link>
    </Nav>
  </Navbar>
);

const FooterLogo = styled(Image)`
  height: 15px;
  width: 15px;
`;

export default Footer;
