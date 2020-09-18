import React from "react";
import {NavLink, Nav, Container} from 'react-bootstrap';

function Footer() {
  return (
    <Container>
    <Nav className="fixed-bottom justify-content-center">
    <NavLink href="/">HOME</NavLink>
    <NavLink href="/who-we-are">WHO WE ARE</NavLink>
    <NavLink href="/resources">RESOURCES</NavLink>
    <NavLink href="/faq">FAQ</NavLink>
    </Nav>
    </Container>
  );
}

export default Footer;
