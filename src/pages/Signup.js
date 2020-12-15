import React from 'react';
import Container from 'react-bootstrap/Container';
import IdentityCard from '../components/Sign-Up/left-components/identity-cards';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Green_blob from '../images/green_blob.svg';
import Individual_Dancer from '../images/wwww-2.svg';
import Red_blob from '../images/red_blob.svg';
import Individual_Dancer_2 from '../images/waw_dance.svg';

function Signup() {
    const types = [
        {id:1,blob:Green_blob,dancer:Individual_Dancer,text:"An Individual",hoverColor:"#82B29A",url:"/sign-up/individual"},
        {id:2,blob:Red_blob,dancer:Individual_Dancer_2,text:"A Theatre Group",hoverColor:"#E17B60",url:"/sign-up/company"},
      ]
  return (
      <Container className="margin-container">
          <h1 className="title">BUILD CONNECTIONS TODAY</h1>
    <h2 className="tagline">Join the community today for new opportunities</h2>
    <h3 className="subtitle">I AM...</h3>
    <Row>
      {
        types.map(who=>(
          <Col lg={3} className="margin-identity-cards">
            <IdentityCard blob={who.blob} dancer={who.dancer} text={who.text} url={who.url} hover={who.hoverColor}/>
          </Col>
        ))
      }
    </Row>
    <p>Already a member? <a href="/sign-up" id="email">Log in here</a></p> 
      </Container>
);
}

export default Signup;