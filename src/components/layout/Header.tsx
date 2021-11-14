import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import { getSessionCookie } from '../../utils/session';
import { colors } from '../../theme/styleVars';
import { ReactComponent as Logo } from '../../images/cagLogo1.svg';
// import yellowBlob1 from '../../images/yellow_blob_1.svg';
// import yellowBlob2 from '../../images/yellow_blob_2.svg';
// import greenBlob from '../../images/green_blob.svg';
// import redBlob from '../../images/red_blob.svg';

const Header = () => {
  const [session, setSession] = useState(getSessionCookie());
  const showSession = !!(
    session &&
    session.data &&
    session.data.userId !== undefined &&
    session.data.active_status !== undefined &&
    session.data.active_status
  );
  // const blobs = [
  //   {
  //     id: 1,
  //     blob: yellowBlob1,
  //     inset: '-2.33% 70.54% 83.94% -7.8%',
  //     opacity: 0.85,
  //     transform: ''
  //   },
  //   {
  //     id: 2,
  //     blob: redBlob,
  //     inset: '2.91% 46.09% 81.3% 17.6%',
  //     opacity: 0.6,
  //     transform: ''
  //   },
  //   {
  //     id: 3,
  //     blob: greenBlob,
  //     inset: '-6.34% 2.34% 91.2% 63.75%',
  //     opacity: 0.7,
  //     transform: ''
  //   },
  //   {
  //     id: 4,
  //     blob: yellowBlob2,
  //     inset: '19.59% -14.76% 63.5% 87.52%',
  //     opacity: 0.85,
  //     transform: 'rotate(-124.79deg)'
  //   }
  // ];

  useEffect(() => {
    const detectCookieUpdate = () => setSession(getSessionCookie());
    const interval = window.setInterval(detectCookieUpdate, 250);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <BlobRow>
        {/* {blobs.map(blobs => (
          <img
            alt=""
            key={blobs.id}
            src={blobs.blob}
            style={{
              inset: blobs.inset,
              opacity: blobs.opacity,
              transform: blobs.transform
            }}
          />
        ))} */}
      </BlobRow>
      <WhiteBackNav
        className="container nav white-back"
        expand="lg"
        sticky="top"
      >
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
    </>
  );
};

const WhiteBackNav = styled(Navbar)`
  background-color: ${colors.white80a};
  max-width: 90rem;
  padding: 0.875rem 5rem;
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

const BlobRow = styled(Row)`
  max-width: 100vw;
  overflow: hidden;
  img {
    position: absolute;
  }
`;

export default Header;
