import React from 'react';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { colors } from '../theme/styleVars';
import PageContainer from '../components/layout/PageContainer';
import { Tagline, Title, TitleThree } from '../components/layout/Titles';
// import WhoSquare from '../components/Home/WhoSquare';
// import SVGLayer from '../components/SVGLayer';
import yellowBlob1 from '../images/yellow_blob_1.svg';
import yellowBlob2 from '../images/yellow_blob_2.svg';
import greenBlob from '../images/green_blob.svg';
import dance1 from '../images/wwww-1.svg';
import redBlob from '../images/red_blob.svg';
import dance2 from '../images/wwww-2.svg';
import blueBlob1 from '../images/blue_blob.svg';
import dance3 from '../images/wwww-3.svg';

const Home = () => {
  const blobs = [
    {
      id: 1,
      blob: yellowBlob1,
      zIndex: -1,
      position: 'absolute',
      left: -7.97,
      top: -5.25,
      transform: 0
    },
    {
      id: 2,
      blob: redBlob,
      zIndex: -2,
      position: 'absolute',
      left: 17.55,
      top: 6.5,
      transform: 0
    },
    {
      id: 3,
      blob: greenBlob,
      zIndex: -3,
      position: 'absolute',
      left: 63.75,
      top: -14.3,
      transform: 'rotate(0deg)'
    },
    {
      id: 4,
      blob: yellowBlob2,
      zIndex: -4,
      position: 'absolute',
      left: 85.72,
      top: 44.25,
      transform: -124.79
    }
  ];

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
    <>
      <BlobRow>
        {blobs.map(blobs => (
          <Col key={blobs.id}>
            <img
              alt=""
              //left={blobs.left}
              //position='absolute'
              src={blobs.blob}
              //top={blobs.top}'rem'
              //transform={blobs.transform}
              z-index={blobs.zIndex}
            />
          </Col>
        ))}
      </BlobRow>
      <PageContainer>
        <Row>
          <Col lg={8}>
            <Title>CHICAGO ARTIST GUIDE</Title>
            <Tagline>Diversifying theater one connection at a time.</Tagline>
            <StartButton>
              <Nav.Link as={Link} to="/login">
                GET STARTED
              </Nav.Link>
            </StartButton>
          </Col>
          {/* <Col lg={4}>
					<SVGLayer blob={yellowBlob1} dancer={homeDance} />
				</Col> */}
        </Row>
        <TitleThree className="margin-top">WHO WE WORK WITH</TitleThree>
        <Row>
          {whoWeWorkWith.map(who => (
            <MarginCol key={who.id} lg={true}>
              {/* <WhoSquare
							blob={who.blob}
							dancer={who.dancer}
							points={who.points}
							title={who.title}
						/> */}
            </MarginCol>
          ))}
        </Row>
      </PageContainer>
    </>
  );
};

const MarginCol = styled(Col)`
  margin-top: 2%;
  margin-bottom: 2%;
`;

const BlobRow = styled(Row)`
  width: 100vw;
  position: absolute;
  overflow: hidden;
  z-index: -1;
  opacity: 0.6;
`;

// const BlobImg = styled.img`
//   alt: "";
//   src: ${Blob.blob};
//   z-index: ${blobs.zIndex};
//   position: absolute;
//   left: ${blobs.left}rem;
//   top: ${blobs.top}rem;
//   transform: ${blobs.transform};

// `;

const StartButton = styled(Button)`
  height: 40px;
  width: 151px;
  display: flex;
  background: ${colors.slate};
  font: inherit;
  border: 0px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;

  .nav-link {
    color: #fff;
    flex-shrink: 0;
  }
`;

export default Home;
