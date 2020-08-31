import React, { useState } from 'react';
import { Navbar, NavDropdown, Nav } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import logo from '../../images/logo.png';

function Header() {
  //Hook
  const [show, setShow] = useState(false);

  const showDropdown = (e)=>{
    setShow(!show);
  }

  const hideDropdown = e => {
    setShow(false);
  }
  
  return(
    <div className="container">
    <Navbar className="bg-white" expand="lg">
    <Navbar.Brand href="/#home">
    <img 
      src={logo}
      width="100"
      alt="Chicago Artist Guide"
    />
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mr-auto">
    <NavDropdown title="Home" 
      id="basic-nav-dropdown"
      show={show}
      onMouseEnter={showDropdown} 
      onMouseLeave={hideDropdown}>
    <NavDropdown.Item href="/#what-we-do">What We Do</NavDropdown.Item>
    <NavDropdown.Item href="/#who-we-are">Who We Are</NavDropdown.Item>
      <NavDropdown.Item href="/#contact-us">Contact Us</NavDropdown.Item>
      </NavDropdown>
      <Nav.Link href="/resources">Resource Hub</Nav.Link>
      <Nav.Link href="/blog">Blog</Nav.Link>
      </Nav>
        <Button inline href="/registration" variant="primary" size='md'>Log In or Get Started</Button>
  </Navbar.Collapse>
</Navbar>
</div>
);
}

export default Header;