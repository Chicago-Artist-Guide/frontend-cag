import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Button from 'react-bootstrap/Button';
import { Tagline, Title } from '../layout/Titles';
import SVGLayer from '../SVGLayer';
import Individual_Dancer from '../../images/wwww-2.svg';
import Individual_Dancer_2 from '../../images/wwww-2.svg';
import Green_blob from '../../images/green_blob.svg';
import Red_blob from '../../images/red_blob.svg';

const Card: React.FC<{
  blob: any;
  dancer: any;
  text: any;
  input: any;
  key: string;
}> = ({ blob, dancer, text, input }) => {
  return (
    <Col className="shadow-identity-cards" lg="6">
      <SVGLayer blob={blob} dancer={dancer} />
      <div>
        <p>{text}</p>
        <div>{input}</div>
      </div>
    </Col>
  );
};

const Landing: React.FC<{ setForm: any; formData: any; navigation: any }> = ({
  setForm,
  formData,
  navigation
}) => {
  const { landingType, landingPerformType } = formData;
  const { next } = navigation;
  const [landingStep, setLandingStep] = useState(1);

  const cards = [
    [
      {
        blob: Green_blob,
        dancer: Individual_Dancer,
        text: <span>An Individual</span>,
        input: (
          <ToggleButton
            checked={landingType === 'individual'}
            name="landingType"
            onChange={setForm}
            type="radio"
            value="individual"
          />
        )
      },
      {
        blob: Red_blob,
        dancer: Individual_Dancer_2,
        text: <span>A Theatre Group</span>,
        input: (
          <ToggleButton
            checked={landingType === 'group'}
            name="landingType"
            onChange={setForm}
            type="radio"
            value="group"
          />
        )
      }
    ],
    [
      {
        blob: Green_blob,
        dancer: Individual_Dancer,
        text: (
          <span>
            <strong>On-Stage</strong> (Actors, Singers, Dancers)
          </span>
        ),
        input: (
          <ToggleButton
            checked={landingPerformType === 'on-stage'}
            name="landingPerformType"
            onChange={setForm}
            type="radio"
            value="on-stage"
          />
        )
      },
      {
        blob: Red_blob,
        dancer: Individual_Dancer_2,
        text: (
          <span>
            <strong>Off-Stage</strong> (Directors, Production Designers, Crew)
          </span>
        ),
        input: (
          <ToggleButton
            checked={landingPerformType === 'off-stage'}
            name="landingPerformType"
            onChange={setForm}
            type="radio"
            value="off-stage"
          />
        )
      }
    ]
  ];

  return (
    <Container className="margin-container">
      <Row>
        <Col lg={12}>
          <Title>
            {landingStep === 1
              ? 'BUILD CONNECTIONS TODAY'
              : 'WHERE DO YOU PERFORM?'}
          </Title>
          <Tagline>
            {landingStep === 1
              ? 'Join the Community today for new opportunities'
              : 'On-Stage? Off-Stage? Both?'}
          </Tagline>
        </Col>
      </Row>
      <Row>
        <Col lg={8}>
          <Row>
            {cards[landingStep - 1].map((card, i) => {
              return <Card {...card} key={`card-${landingStep}-${i}`} />;
            })}
          </Row>
        </Col>
      </Row>
      <Row>
        <Col lg="8">
          {landingStep === 2 && (
            <Button
              onClick={() => setLandingStep(1)}
              type="button"
              variant="secondary"
            >
              Back
            </Button>
          )}
          <Button
            onClick={landingStep === 2 ? next : () => setLandingStep(2)}
            type="button"
            variant="primary"
          >
            Continue
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Landing;
