import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import { getSessionCookie } from '../../utils/session';
import { colors } from '../../theme/styleVars';
import { ReactComponent as Logo } from '../../images/cagLogo1.svg';

const Header = () => {
  const [session, setSession] = useState(getSessionCookie());
  const showSession = !!(
    session &&
    session.data &&
    session.data.userId !== undefined &&
    session.data.active_status !== undefined &&
    session.data.active_status
  );

  useEffect(() => {
    const detectCookieUpdate = () => setSession(getSessionCookie());
    const interval = window.setInterval(detectCookieUpdate, 250);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <WhiteBackNav className="container nav white-back" expand="lg" sticky="top">
      <Navbar.Brand href="/">
        <Logo height="52px" width="62px" />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link as={Link} to="/">
            HOME
          </Nav.Link>
          <Nav.Link as={Link} to="/who-we-are">
            WHO WE ARE
          </Nav.Link>
          <Nav.Link as={Link} to="/donate">
            DONATE
          </Nav.Link>
          <LogButton>
            {!showSession && (
              <Nav.Link as={Link} to="/login">
                LOG IN / SIGN UP
              </Nav.Link>
            )}
            {showSession && (
              <Nav.Link as={Link} to="/logout">
                LOGOUT
              </Nav.Link>
            )}
          </LogButton>
        </Nav>
      </Navbar.Collapse>
    </WhiteBackNav>
  );
};

const WhiteBackNav = styled(Navbar)`
  background-color: ${colors.white80a};
  max-width: 100%;
  padding: 0.875rem 6.15vw;
  backdrop-filter: blur(15px);
`;

const LogButton = styled(Button)`
  height: 40px;
  width: 183px;
  display: flex;
  background: ${colors.mint};
  font: inherit;
  font-weight: 700;
  margin-left: 0.5rem;
  border: 0px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;

  .nav-link {
    flex-shrink: 0;
  }
`;

export default Header;
