import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import BlobBox from '../layout/BlobBox';
import CardBox from '../layout/CardBox';
import { redBlob, yellowBlob1 } from '../../images';
import {
  makeProfile,
  promotions,
  receiveNotices,
  submitToJobs
} from '../../images/icons-home';
import { colors } from '../../theme/styleVars';
import DividerBar from '../../genericComponents/DividerBar';

const ForArtists = () => {
  const blobs = [
    {
      id: 1,
      blob: yellowBlob1,
      opacity: 0.85,
      transform: 'rotate(315deg) scale(1.3, 1.1)',
      translate: '3vw 8vh'
    },
    {
      id: 2,
      blob: redBlob,
      opacity: 0.6,
      transform: 'rotate(-7deg) scale(1.2, 1.4)',
      translate: '-3vw 1vh'
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
    <>
      <ArtistsRow>
        <WordBox>
          <DividerBar
            style={{
              backgroundImage:
                'linear-gradient(90deg, #EFC93D 0%, #E17B60 100%)'
            }}
          />
          <h2>FOR THEATRE ARTISTS</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque nulla ut suspendisse tincidunt adipiscing ac ornare. A,
            cursus turpis sit pellentesque metus posuere. Neque, quisque mattis
            bibendum nibh vitae, auctor viverra arcu. Vestibulum dui diam et
            varius. Integer nibh aliquam elementum tempor enim turpis.
            Adipiscing magna ut pulvinar potenti ipsum, at tortor vitae. In at
            euismod non consequat id nec egestas in erat. Mi lacus feugiat et a
            proin.
          </p>
          <BuildButton>
            <Nav.Link as={Link} to="/SignUp">
              BUILD YOUR PROFILE
            </Nav.Link>
          </BuildButton>
        </WordBox>
        <CardBox cards={cards} />
        <BlobBox blobs={blobs} />
      </ArtistsRow>
    </>
  );
};

const ArtistsRow = styled(Row)`
  display: grid;
  width: 100%;
  height: 960px;
  padding: 70px 0;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: "wordBox cardBox";
  div:nth-child(2),
  div:nth-child(3) {
    grid-area: cardBox;
  }
`;

const WordBox = styled.div`
  margin-right: 70px;
  margin-top: 210px;
  grid-area: wordBox;
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
  background: ${colors.salmon};
  border-radius: 20px;
  border: none;
  box-shadow: 0px 0px 8px 4px rgba(0, 0, 0, 0.05);

  .nav-link {
    color: #fff;
    flex-shrink: 0;
  }
`;

export default ForArtists;
