import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import WhoSquare from "../components/Home/who-we-work-with.js";

import SVGLayer from "../components/svg-layer.js";

import Yellow_blob_1 from '../images/yellow_blob_1.svg';
import Home_dance from '../images/home_dance.svg';

import Green_blob from '../images/green_blob.svg';
import Dance_1 from '../images/wwww-1.svg';

import Red_blob from '../images/red_blob.svg';
import Dance_2 from '../images/wwww-2.svg';

import Blue_blob_1 from '../images/blue_blob.svg';
import Dance_3 from '../images/wwww-3.svg';


function Home() {

  const whoWeWorkWith = [
    {id:1,title:"Individual Artists",
    points:[
    {id:"a",
    text:"Connections to affordable help for artists"},
    {id:"b",
    text:"Create a business profile"},
    {id:"c",
    text:"Apply for jobs"},
  ],
    blob:Green_blob,
    dancer:Dance_1
    },

    {id:2,title:"Theatre Companies",
      points:[
    {id:"a",
    text:"Information for operations, resources, & best practices"},
    {id:"b",
    text:"Hire staff, designers, and crews"},
    {id:"c",
    text:"Cast your productions"},
    {id:"d",
    text:"Connect to local and nation businesses and educational organizations that support the arts"},
  ],         
  blob:Red_blob,
      dancer:Dance_2
    },
    {id:3,title:"Communities",
    points:[
      {id:"a",
      text:"Connections to affordable help for artists"},
      {id:"b",
      text:"Create a business profile"},
      {id:"c",
      text:"Apply for jobs"},
    ],  
      blob:Blue_blob_1,
      dancer:Dance_3
    }
  ];

  return (
    <Container className="margin-container">
              {/*Hero Section*/}
          <Row>
          <Col lg={8}>
            <h1 className="title">CHICAGO ARTIST GUIDE</h1>
            <h2 className="tagline">We make connections. You make art.</h2>
            <h3 className="subtitle">WHAT WE DO</h3>
            <p className="margin-container">
            We bring Chicago individual artists, theatre companies, and communities together. 
            We provide the infrastructure so you can focus on what you do best.
            </p>
          </Col>
          <Col lg={4}>
          <SVGLayer blob={Yellow_blob_1} dancer={Home_dance}/>
          </Col>
        </Row>

  <h3 className="subtitle margin-top">WHO WE WORK WITH</h3>

          <Row>
            {
              whoWeWorkWith.map(who=>(
                <Col lg={true} className="margin-wwww" key={who.id}>
                  <WhoSquare blob={who.blob} dancer={who.dancer} title={who.title} points={who.points}/>
                </Col>
              ))
            }
          </Row>

      </Container>
);
}

export default Home;
