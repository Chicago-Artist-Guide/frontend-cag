import React from 'react';
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import {ReactComponent as Logo} from '../../images/logoPlain.svg';

function Header() {
  return (
    <Navbar expand="lg" className="white-back nav" sticky="top">
      <Navbar.Brand href="/">
      <Logo height="60px" width="70px"/>
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="ml-auto">
        <Nav.Link href="/">HOME</Nav.Link>
        <Nav.Link href="/who-we-are">WHO WE ARE</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
    );
}

export default Header;
