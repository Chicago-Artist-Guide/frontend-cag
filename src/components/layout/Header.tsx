import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import styled from 'styled-components';
import { useUserContext } from '../../context/UserContext';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Logo } from '../../config/publicImages';
import { getUnreadThreadCount } from '../../services/messages/client';
import { colors } from '../../theme/styleVars';
import { reloadDocument } from '../../utils/navigation';

const Header = () => {
  const { currentUser, account } = useUserContext();
  const {
    profile: { id: profileId }
  } = useUserContext();
  const { isAdmin } = useAdminAuth();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  // Handle sign-up link click to reset to initial screen when already on sign-up page
  const handleSignUpClick = (e: React.MouseEvent) => {
    setExpanded(false);
    if (pathname === '/sign-up') {
      e.preventDefault();
      reloadDocument(window.location);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };

    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);

  // Close menu when location changes
  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  // DEV-382: keep the artist's unread-interest badge fresh on login and on
  // every navigation (e.g. after visiting Messages and marking a thread
  // seen). Scoped to individual/artist accounts only — theatre-side
  // notifications are a separate, unticketed requirement.
  useEffect(() => {
    let active = true;
    const accountId = account?.id;
    const accountType = account?.data?.type;

    if (!accountId || accountType !== 'individual') {
      setUnreadCount(0);
      return () => {
        active = false;
      };
    }

    getUnreadThreadCount(accountId, accountType)
      .then((count) => {
        if (active) setUnreadCount(count);
      })
      .catch(() => {
        if (active) setUnreadCount(0);
      });

    return () => {
      active = false;
    };
  }, [account?.data?.type, account?.id, pathname]);

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
      <Navbar.Brand as={Link} href="/" onClick={handleNavClick}>
        <LogoImage src={Logo} alt="CAG Logo" height="60" width="70" />
      </Navbar.Brand>
      <Navbar.Toggle
        aria-controls="basic-navbar-nav"
        aria-expanded={expanded}
        className="border-0 p-1 shadow-none"
      />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto ms-auto">
          <Nav.Link as={Link} href="/" onClick={handleNavClick}>
            HOME
          </Nav.Link>
          <Nav.Link as={Link} href="/about-us" onClick={handleNavClick}>
            ABOUT US
          </Nav.Link>
          {/* <Nav.Link as={Link} href="/shows" onClick={handleNavClick}>
            SHOWS
          </Nav.Link> */}
          <Nav.Link as={Link} href="/donate" onClick={handleNavClick}>
            DONATE
          </Nav.Link>
          <Nav.Link as={Link} href="/get-involved" onClick={handleNavClick}>
            GET INVOLVED
          </Nav.Link>
          <Nav.Link as={Link} href="/events" onClick={handleNavClick}>
            EVENTS
          </Nav.Link>
          {profileId !== null ? (
            <Nav.Link as={Link} href="/profile" onClick={handleNavClick}>
              PROFILE
              {unreadCount > 0 && (
                <NotificationBadge
                  aria-label={`${unreadCount} unread messages`}
                >
                  {unreadCount}
                </NotificationBadge>
              )}
            </Nav.Link>
          ) : (
            <>
              <Nav.Link as={Link} href="/sign-up" onClick={handleSignUpClick}>
                SIGN UP
              </Nav.Link>
              <Nav.Link as={Link} href="/login" onClick={handleNavClick}>
                LOGIN
              </Nav.Link>
            </>
          )}
          {isAdmin && (
            <Nav.Link as={Link} href="/admin" onClick={handleNavClick}>
              ADMIN
            </Nav.Link>
          )}
          {currentUser !== null && (
            <Nav.Link as={Link} href="/logout" onClick={handleNavClick}>
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

// Prevent Safari dark mode from inverting logo colors
const LogoImage = styled.img`
  color-scheme: light only;
`;

const NotificationBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  margin-left: 6px;
  padding: 0 5px;
  border-radius: 9px;
  background-color: ${colors.salmon};
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  vertical-align: middle;
`;

export default Header;
