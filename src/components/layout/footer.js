import React from 'react';
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Image from 'react-bootstrap/Image';
import Facebook from '../../images/icons-footer/facebook-f-brands.svg';
import Linkedin from '../../images/icons-footer/linkedin-in-brands.svg';
import Envelope from '../../images/icons-footer/envelope-regular.svg'; 

function Footer() {
  return (
    <Navbar className="nav" expand="sm" sticky="bottom">
      <Nav className="m-auto">
          <Nav.Link href="/">HOME</Nav.Link>
          <Nav.Link href="/who-we-are">WHO WE ARE</Nav.Link>
          <Nav.Link href="/terms-of-service">TERMS OF SERVICE</Nav.Link>
          <Nav.Link href="/faq">FAQ</Nav.Link>
          <Nav.Link  href={"http://www.facebook.com/chiartistguide"}><Image className="footer-logo" src={Facebook}/></Nav.Link>
          <Nav.Link  href={"https://www.linkedin.com/company/chicago-artist-guide"}><Image className="footer-logo" src={Linkedin}/></Nav.Link>
          <Nav.Link  href={"mailto:contact@chicagoartistguide.org"}><Image className="footer-logo" src={Envelope}/></Nav.Link>
      </Nav>
  </Navbar>
);
}

export default Footer;
