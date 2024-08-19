import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { DividerBar } from '../../components/shared';
import { redBlob, yellowBlob1 } from '../../images';
import {
  makeProfile,
  promotions,
  receiveNotices,
  submitToJobs
} from '../../images/icons-home';
import { breakpoints, colors } from '../../theme/styleVars';
import { BlobBox, CardBox } from '../layout';

const ForArtists = () => {
  const blobs = [
    {
      id: 1,
      blob: yellowBlob1,
      opacity: 0.85,
      transform: 'rotate(315deg) scale(1)',
      translate: '0, 10rem'
    },
    {
      id: 2,
      blob: redBlob,
      opacity: 0.6,
      transform: 'rotate(-7deg) scale(1)',
      translate: '0, 10rem'
    }
  ];

  const cards = [
    {
      id: 1,
      image: makeProfile,
      divider: DividerBar,
      header: 'Make a Profile',
      text: 'To let us know who you are and what your talents are'
    },
    {
      id: 2,
      image: promotions,
      divider: DividerBar,
      header: 'Promote Current Work',
      text: 'Let everyone know what you are up to'
    },
    {
      id: 3,
      image: receiveNotices,
      divider: DividerBar,
      header: 'Receive Job Notices',
      text: "They'll be filtered just for you"
    },
    {
      id: 4,
      image: submitToJobs,
      divider: DividerBar,
      header: 'Submit to Jobs',
      text: 'Easily, with the click of a button'
    }
  ];

  return (
    <ArtistsRow>
      <WordBox>
        <DividerBar
          style={{
            backgroundImage: 'linear-gradient(90deg, #EFC93D 0%, #E17B60 100%)'
          }}
        />
        <h2>FOR THEATRE ARTISTS</h2>
        <p>
          At Chicago Artist Guide, we're reimagining how theatre talent finds,
          auditions for, and gets casted for productions.
        </p>
        <p>
          We envision a more equitable, accessible way for diverse actors,
          artists, and crew to connect directly with theatre groups, all in an
          easy-to-use online network.
        </p>
        <p>
          Want to be the first to know when our platform launches? Scroll down
          to sign up for email updates from our team!
        </p>
        <Nav.Link as={BuildButton} to="/sign-up">
          SIGN UP
        </Nav.Link>
      </WordBox>
      <CardBox cards={cards} style={{ marginLeft: '70px' }} />
      <BlobBox blobs={blobs} />
    </ArtistsRow>
  );
};

const ArtistsRow = styled(Row)`
  width: 100%;
  padding: 35px 0;
  display: flex;
  flex-direction: column;
  margin-right: 0;
  margin-left: 0;

  @media (min-width: ${breakpoints.md}) {
    display: grid;
    grid-template-areas: 'wordBox imgBox';
    grid-template-columns: repeat(2, 1fr);
    margin-right: -15px;
    margin-left: -15px;
  }

  div:nth-child(2),
  div:nth-child(3) {
    grid-area: imgBox;
  }
`;

const WordBox = styled.div`
  grid-area: wordBox;
  align-self: center;
  text-align: center;
  padding: 20px;
  display: flex;
  align-items: center;
  flex-direction: column;

  @media (min-width: ${breakpoints.md}) {
    margin-right: 70px;
    text-align: left;
    padding: 0;
    display: block;
  }
`;

const BuildButton = styled(Link)`
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 18px;
  width: 220px;
  height: 40px;
  background: ${colors.salmon};
  border-radius: 20px;
  border: none;
  box-shadow: 0px 0px 8px 4px rgba(0, 0, 0, 0.05);

  @media (min-width: ${breakpoints.md}) {
    position: absolute;
  }

  &:hover {
    color: white;
    background: ${colors.salmon}95;
  }

  .nav-link {
    color: #fff;
    flex-shrink: 0;
  }
`;

export default ForArtists;
