import React, { useState, useEffect, useRef } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUserContext } from '../../context/UserContext';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import Logo from '../../images/cagLogo1.svg';
import { colors } from '../../theme/styleVars';
import { zeffyUrl } from '../../utils/marketing';

const Header = () => {
  const { currentUser } = useUserContext();
  const {
    profile: { ref: profileRef }
  } = useUserContext();
  const { isStaff } = useStaffAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };

    // Close menu when route changes
    const handleRouteChange = () => {
      setExpanded(false);
    };

    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('popstate', handleRouteChange);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [expanded]);

  // Close menu when location changes
  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

  // Handle nav link clicks - close menu
  const handleNavClick = () => {
    setExpanded(false);
  };

  return (
    <WhiteBackNav
      ref={navRef}
      className="nav white-back container"
      expand="lg"
      sticky="top"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Navbar.Brand as={Link} to="/" onClick={handleNavClick}>
        <img src={Logo} alt="CAG Logo" height="60" width="70" />
      </Navbar.Brand>
      <Navbar.Toggle
        aria-controls="basic-navbar-nav"
        aria-expanded={expanded}
        className="border-0 p-1 shadow-none"
      />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto ms-auto">
          <Nav.Link as={Link} to="/" onClick={handleNavClick}>
            HOME
          </Nav.Link>
          <Nav.Link as={Link} to="/about-us" onClick={handleNavClick}>
            ABOUT US
          </Nav.Link>
          {/* <Nav.Link as={Link} to="/shows" onClick={handleNavClick}>
            SHOWS
          </Nav.Link> */}
          <Nav.Link href={zeffyUrl} onClick={handleNavClick}>
            DONATE
          </Nav.Link>
          <Nav.Link as={Link} to="/events" onClick={handleNavClick}>
            EVENTS
          </Nav.Link>
          {profileRef !== null ? (
            <Nav.Link as={Link} to="/profile" onClick={handleNavClick}>
              PROFILE
            </Nav.Link>
          ) : (
            <>
              <Nav.Link
                as={Link}
                to="/sign-up"
                onClick={(e) => {
                  handleSignUpClick(e);
                  handleNavClick();
                }}
              >
                SIGN UP
              </Nav.Link>
              <Nav.Link as={Link} to="/login" onClick={handleNavClick}>
                LOGIN
              </Nav.Link>
            </>
          )}
          {isStaff && (
            <Nav.Link as={Link} to="/staff/analytics" onClick={handleNavClick}>
              ANALYTICS
            </Nav.Link>
          )}
          {currentUser !== null && (
            <Nav.Link as={Link} to="/logout" onClick={handleNavClick}>
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

  @media (max-width: 991.98px) {
    padding: 0.75rem 2.5rem;
  }

  @media (max-width: 575.98px) {
    padding: 0.75rem 1.25rem;
  }
`;

export default Header;
