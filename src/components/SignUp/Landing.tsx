import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import SVGLayer from '../../components/svg-layer';
import Individual_Dancer from '../../images/wwww-2.svg';
import Green_blob from '../../images/green_blob.svg';
import Red_blob from '../../images/red_blob.svg';

const Card = () => {
  return (
    
  );
}

const Landing = ({ setForm, formData, navigation }) => {
  const { landingType, landingPerformType } = formData;
  const { next } = navigation;
  const [landingStep, setLandingStep] = useState(1);

  return (
    <Container className="margin-container">
      <Row>
        <div>
          <h1 className="title">BUILD CONNECTIONS TODAY</h1>
          <h2 className="tagline">Join the Community today for new opportunities</h2>
        </div>
        </Row>
        <Row>
        <Col lg={8}>
          {props.comp}
        </Col>
        <Col lg={4}>
        <SVGLayer blob={props.blob} dancer={props.dancer}/>
        </Col>
      </Row>
    </Container>
  );
};

export default Landing;