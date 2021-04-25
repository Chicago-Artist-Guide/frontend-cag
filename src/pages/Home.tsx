import React from 'react';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import { Tagline, Title, TitleThree } from '../components/layout/Titles';
import WhoSquare from '../components/Home/WhoSquare';
import SVGLayer from '../components/SVGLayer';
import yellowBlob1 from '../images/yellow_blob_1.svg';
import homeDance from '../images/home_dance.svg';
import greenBlob from '../images/green_blob.svg';
import dance1 from '../images/wwww-1.svg';
import redBlob from '../images/red_blob.svg';
import dance2 from '../images/wwww-2.svg';
import blueBlob1 from '../images/blue_blob.svg';
import dance3 from '../images/wwww-3.svg';

const Home = () => {
  const whoWeWorkWith = [
    {
      id: 1,
      title: 'Individual Artists',
      points: [
        {
          id: 'a',
          text: 'Connections to affordable help for artists'
        },
        {
          id: 'b',
          text: 'Create a business profile'
        },
        {
          id: 'c',
          text: 'Apply for jobs'
        }
      ],
      blob: greenBlob,
      dancer: dance1
    },
    {
      id: 2,
      title: 'Theatre Companies',
      points: [
        {
          id: 'a',
          text: 'Information for operations, resources, & best practices'
        },
        {
          id: 'b',
          text: 'Hire staff, designers, and crews'
        },
        {
          id: 'c',
          text: 'Cast your productions'
        },
        {
          id: 'd',
          text:
            'Connect to local and nation businesses and educational organizations that support the arts'
        }
      ],
      blob: redBlob,
      dancer: dance2
    },
    {
      id: 3,
      title: 'Communities',
      points: [
        {
          id: 'a',
          text: 'Connections to affordable help for artists'
        },
        {
          id: 'b',
          text: 'Create a business profile'
        },
        {
          id: 'c',
          text: 'Apply for jobs'
        }
      ],
      blob: blueBlob1,
      dancer: dance3
    }
  ];

  return (
    <PageContainer>
      <Row>
        <Col lg={8}>
          <Title>CHICAGO ARTIST GUIDE</Title>
          <Tagline>We make connections. You make art.</Tagline>
          <TitleThree>WHAT WE DO</TitleThree>
          <p className="margin-container">
            We provide affordable and free tools to help diversify theatre in
            Chicago.
          </p>
        </Col>
        <Col lg={4}>
          <SVGLayer blob={yellowBlob1} dancer={homeDance} />
        </Col>
      </Row>
      <TitleThree className="margin-top">WHO WE WORK WITH</TitleThree>
      <Row>
        {whoWeWorkWith.map(who => (
          <MarginCol key={who.id} lg={true}>
            <WhoSquare
              blob={who.blob}
              dancer={who.dancer}
              points={who.points}
              title={who.title}
            />
          </MarginCol>
        ))}
      </Row>
    </PageContainer>
  );
};

const MarginCol = styled(Col)`
  margin-top: 2%;
  margin-bottom: 2%;
`;

export default Home;
