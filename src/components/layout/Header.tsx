import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUserContext } from '../../context/UserContext';
import Logo from '../../images/cagLogo1.svg';
import { colors } from '../../theme/styleVars';

const Header = () => {
  const { currentUser } = useUserContext();
  const {
    profile: { ref: profileRef }
  } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle sign-up link click to reset to initial screen when already on sign-up page
  const handleSignUpClick = (e: React.MouseEvent) => {
    if (location.pathname === '/sign-up') {
      e.preventDefault();
      // Force a refresh of the sign-up page to reset the state
      navigate('/', { replace: true });
      setTimeout(() => {
        navigate('/sign-up');
      }, 0);
    }
  };

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
          <Nav.Link as={Link} to="/about-us">
            ABOUT US
          </Nav.Link>
          {/* <Nav.Link as={Link} to="/shows">
            SHOWS
          </Nav.Link> */}
          <Nav.Link as={Link} to="/donate">
            DONATE
          </Nav.Link>
          <Nav.Link as={Link} to="/events">
            EVENTS
          </Nav.Link>
          {profileRef !== null ? (
            <Nav.Link as={Link} to="/profile">
              PROFILE
            </Nav.Link>
          ) : (
            <>
              <Nav.Link as={Link} to="/sign-up" onClick={handleSignUpClick}>
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
