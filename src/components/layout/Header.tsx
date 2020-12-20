import React from 'react';
import styled from 'styled-components';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { colors } from '../../theme/styleVars';
import { ReactComponent as Logo } from '../../images/logoPlain.svg';

const Header = () => (
  <WhiteBackNav className="white-back nav" expand="lg" sticky="top">
    <Navbar.Brand href="/">
      <Logo height="60px" width="70px" />
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="ml-auto">
        <Nav.Link href="/">HOME</Nav.Link>
        <Nav.Link href="/who-we-are">WHO WE ARE</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </WhiteBackNav>
);

const WhiteBackNav = styled(Navbar)`
  background-color: ${colors.bodyBg};
`;

export default Header;
