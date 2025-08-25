import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useUserContext } from '../../context/UserContext';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import Logo from '../../images/cagLogo1.svg';
import { colors } from '../../theme/styleVars';

const Header = () => {
  const { currentUser } = useUserContext();
  const {
    profile: { ref: profileRef }
  } = useUserContext();
  const { isStaff } = useStaffAuth();
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
    <WhiteBackNav className="nav white-back" expand="lg" sticky="top">
      <div className="container-fluid px-sm-4 px-lg-5 px-3">
        <Navbar.Brand as={Link} to="/" className="py-2">
          <img
            src={Logo}
            alt="CAG Logo"
            className="h-10 w-auto sm:h-12 md:h-14"
          />
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="border-0 p-1 shadow-none"
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="px-lg-3 px-2">
              HOME
            </Nav.Link>
            <Nav.Link as={Link} to="/about-us" className="px-lg-3 px-2">
              ABOUT US
            </Nav.Link>
            <Nav.Link as={Link} to="/donate" className="px-lg-3 px-2">
              DONATE
            </Nav.Link>
            <Nav.Link as={Link} to="/events" className="px-lg-3 px-2">
              EVENTS
            </Nav.Link>
            {profileRef !== null ? (
              <Nav.Link as={Link} to="/profile" className="px-lg-3 px-2">
                PROFILE
              </Nav.Link>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/sign-up"
                  onClick={handleSignUpClick}
                  className="px-lg-3 px-2"
                >
                  SIGN UP
                </Nav.Link>
                <Nav.Link as={Link} to="/login" className="px-lg-3 px-2">
                  LOGIN
                </Nav.Link>
              </>
            )}
            {isStaff && (
              <Nav.Link
                as={Link}
                to="/staff/analytics"
                className="px-lg-3 px-2"
              >
                ANALYTICS
              </Nav.Link>
            )}
            {currentUser !== null && (
              <Nav.Link as={Link} to="/logout" className="px-lg-3 px-2">
                LOGOUT
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </div>
    </WhiteBackNav>
  );
};

const WhiteBackNav = styled(Navbar)`
  background-color: ${colors.white80a};
  max-width: 100vw;
  padding: 0.5rem 0;
  backdrop-filter: blur(15px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    padding: 0.75rem 0;
  }

  .navbar-toggler {
    font-size: 1.1rem;

    &:focus {
      box-shadow: none;
    }
  }

  .navbar-nav .nav-link {
    font-weight: 500;
    font-size: 0.9rem;
    color: #3b4448 !important;

    @media (min-width: 992px) {
      font-size: 1rem;
    }

    &:hover {
      color: #82b29a !important;
    }
  }
`;

export default Header;
