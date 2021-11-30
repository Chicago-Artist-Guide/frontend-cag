import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Nav from 'react-bootstrap/Nav';
import { BlobBox, CardBox } from '../layout';
import { greenBlob, yellowBlob1 } from '../../images';
import {
  findCandidates,
  groupProfile,
  postNotices,
  promotions
} from '../../images/icons-home';
import { colors } from '../../theme/styleVars';
import { DividerBar } from '../../genericComponents';

const ForTheatres = () => {
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
      blob: greenBlob,
      opacity: 0.6,
      transform: 'rotate(-7deg) scale(1)',
      translate: '0, 10rem'
    }
  ];

  const cards = [
    {
      id: 1,
      image: groupProfile,
      divider: DividerBar,
      header: 'Make a Group Profile',
      text: 'So artists can  get to know you'
    },
    {
      id: 2,
      image: postNotices,
      divider: DividerBar,
      header: 'Post Casting Notices',
      text: 'Cast + hire easily and clearly with our job templates'
    },
    {
      id: 3,
      image: promotions,
      divider: DividerBar,
      header: 'Promote Productions',
      text: 'Get the word out on your active shows'
    },
    {
      id: 4,
      image: findCandidates,
      divider: DividerBar,
      header: 'Find Candidates',
      text: 'Filter, search, and rate interested artists'
    }
  ];

  return (
    <TheaterRow>
      <CardBox cards={cards} style={{ marginRight: '70px' }} />
      <BlobBox blobs={blobs} />
      <WordBox>
        <DividerBar
          style={{
            backgroundImage: 'linear-gradient(90deg,#EFC93D 0%, #82B29A 100%)'
          }}
        />
        <h2>FOR THEATRE GROUPS</h2>
        <p>
          Casting and hiring haven't always celebrated the diversity of our
          city.
        </p>
        <p>We're here to change that.</p>
        <p>
          Chicago Artist Guide offers more equitable casting and hiring
          opportunities by removing barriers in connecting Chicago's theatre
          companies with the artists it represents.
        </p>
        <p>
          Chicago theatres will be able to use our platform to find artists from
          the communities that their productions represent and invite them
          directly to audition/apply, removing barriers in auditioning, casting,
          and hiring.
        </p>
        <p>
          Want to be the first to know when our platform launches? Scroll down
          to sign up for email updates from our team!
        </p>
        <Nav.Link as={BuildButton} to="#">
          COMING SOON
        </Nav.Link>
      </WordBox>
    </TheaterRow>
  );
};

const TheaterRow = styled(Row)`
  width: 100%;
  padding: 35px 0;
  display: flex;
  flex-direction: column-reverse;
  margin-right: 0;
  margin-left: 0;

  @media (min-width: 768px) {
    display: grid;
    grid-template-areas: "imgBox wordBox";
    grid-template-columns: repeat(2, 1fr);
    margin-right: -15px;
    margin-left: -15px;
  }

  div:nth-child(1),
  div:nth-child(2) {
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

  @media (min-width: 768px) {
    margin-left: 70px;
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
  background: ${colors.mint};
  border-radius: 20px;
  border: none;
  box-shadow: 0px 0px 8px 4px rgba(0, 0, 0, 0.05);

  @media (min-width: 768px) {
    position: absolute;
  }

  &:hover {
    color: white;
    background: ${colors.mint}95;
  }

  .nav-link {
    color: #fff;
    flex-shrink: 0;
  }
`;

export default ForTheatres;
