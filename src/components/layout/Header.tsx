import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useUserContext } from '../../context/UserContext';
import Logo from '../../images/cagLogo1.svg';
import { colors } from '../../theme/styleVars';

const Header = () => {
  const { currentUser } = useUserContext();
  const {
    profile: { ref: profileRef }
  } = useUserContext();

  return (
    <WhiteBackNav className="nav white-back container" expand="lg" sticky="top">
      <Navbar.Brand href="/">
        <img src={Logo} alt="CAG Logo" height="60" width="70" />
        {/* <TypedCagLogo height="60px" width="70px" /> */}
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link as={Link} to="/">
            HOME
          </Nav.Link>
          {/* <Nav.Link as={Link} to="/night-at-the-cag-baret">
            EVENTS
          </Nav.Link> */}
          <Nav.Link as={Link} to="/about-us">
            ABOUT US
          </Nav.Link>
          <Nav.Link as={Link} to="/donate">
            DONATE
          </Nav.Link>
          <NavDropdown title="CAG-BARET" id="basic-nav-dropdown">
            <NavDropdown.Item href="https://www.zeffy.com/ticketing/f021b4c4-c62b-4fbf-b975-689121ed5b71">
              Get your tickets!
            </NavDropdown.Item>
            <NavDropdown.Item href="https://www.zeffy.com/ticketing/5a15d35d-d24e-4a21-926c-1acaec989b6e">
              Silent Auction
            </NavDropdown.Item>
            <NavDropdown.Item href="https://www.canva.com/design/DAGQGLmC-7s/UOuITrpz7miEBS5RjPmOIg/view?utm_content=DAGQGLmC-7s&utm_campaign=designshare&utm_medium=link&utm_source=editor#1">
              Digital Program
            </NavDropdown.Item>
          </NavDropdown>
          {profileRef !== null ? (
            <Nav.Link as={Link} to="/profile">
              PROFILE
            </Nav.Link>
          ) : (
            <>
              <Nav.Link as={Link} to="/sign-up">
                SIGN UP
              </Nav.Link>
              <Nav.Link as={Link} to="/login">
                LOGIN
              </Nav.Link>
            </>
          )}
          {currentUser !== null && (
            <Nav.Link as={Link} to="/logout">
              LOGOUT
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </WhiteBackNav>
  );
};

const WhiteBackNav = styled(Navbar)`
  background-color: ${colors.white80a};
  max-width: 100vw;
  padding: 0.875rem 5rem;
  backdrop-filter: blur(15px);
  position: fixed;
  sticky: top;
  z-index: 100;
`;

export default Header;
