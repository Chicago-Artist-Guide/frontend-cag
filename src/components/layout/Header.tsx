import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthValue } from '../../context/AuthContext';
import { useProfileContext } from '../../context/ProfileContext';
import { ReactComponent as Logo } from '../../images/cagLogo1.svg';
import { colors } from '../../theme/styleVars';

const Header = () => {
  const { currentUser } = useAuthValue();
  const {
    profile: { ref: profileRef }
  } = useProfileContext();

  return (
    <WhiteBackNav className="container nav white-back" expand="lg" sticky="top">
      <Navbar.Brand href="/">
        <Logo height="60px" width="70px" />
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
          <Nav.Link href="https://www.zeffy.com/ticketing/f021b4c4-c62b-4fbf-b975-689121ed5b71">
            CAG-BARET
          </Nav.Link>
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
