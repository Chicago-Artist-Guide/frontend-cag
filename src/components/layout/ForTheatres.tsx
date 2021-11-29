import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
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
      translate: '0 10rem'
    },
    {
      id: 2,
      blob: greenBlob,
      opacity: 0.6,
      transform: 'rotate(-7deg) scale(1)',
      translate: '0 10rem'
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
          nulla ut suspendisse tincidunt adipiscing ac ornare. A, cursus turpis
          sit pellentesque metus posuere. Neque, quisque mattis bibendum nibh
          vitae, auctor viverra arcu. Vestibulum dui diam et varius. Integer
          nibh aliquam elementum tempor enim turpis. Adipiscing magna ut
          pulvinar potenti ipsum, at tortor vitae. In at euismod non consequat
          id nec egestas in erat. Mi lacus feugiat et a proin.
        </p>
        <BuildButton>
          <Nav.Link as={Link} to="/SignUp">
            START SEARCH NOW
          </Nav.Link>
        </BuildButton>
      </WordBox>
    </TheaterRow>
  );
};

const TheaterRow = styled(Row)`
  display: grid;
  width: 100%;
  padding: 35px 0;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: "imgBox wordBox";
  div:nth-child(1),
  div:nth-child(2) {
    grid-area: imgBox;
  }
`;

const WordBox = styled.div`
  margin-left: 70px;
  grid-area: wordBox;
  align-self: center;
`;

const BuildButton = styled(Button)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 18px;
  position: absolute;
  width: 220px;
  height: 40px;
  background: ${colors.mint};
  border-radius: 20px;
  border: none;
  box-shadow: 0px 0px 8px 4px rgba(0, 0, 0, 0.05);

  .nav-link {
    color: #fff;
    flex-shrink: 0;
  }
`;

export default ForTheatres;
