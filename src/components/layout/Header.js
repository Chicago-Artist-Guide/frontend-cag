import React, { useState } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import logo from '../../images/logo.png';

function Header() {
  return(
    <Container>
    <Navbar expand="xl">
    <Navbar.Brand href="/">
    <img 
      src={logo}
      width="100"
      alt="Chicago Artist Guide"
    />
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="ml-auto">
      <Nav.Link href="/">HOME</Nav.Link>
      <Nav.Link href="/who-we-are">WHO WE ARE</Nav.Link>
      <Nav.Link href="/resources">RESOURCES</Nav.Link>
      <Nav.Link href="/blog">BLOG</Nav.Link>
      </Nav>
        <Button inline href="/registration" variant="green text-white" size='md'>LOG IN \ SIGN UP</Button>
  </Navbar.Collapse>
</Navbar>
</Container>
);
}

export default Header;