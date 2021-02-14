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

const Landing: React.FC<{ setForm: any; formData: any; navigation: any }> = ({
  setForm,
  formData,
  navigation
}) => {
  const {
    landingType,
    landingPerformTypeOnStage,
    landingPerformTypeOffStage
  } = formData;
  const { next } = navigation;
  const [landingStep, setLandingStep] = useState(1);

  const Card: React.FC<{
    blob: any;
    dancer: any;
    setForm: any;
    target: any;
    text: any;
    input: any;
    key: string;
  }> = ({ blob, dancer, setForm, target, text, input }) => {
    const setFormCheck = () => {
      const newTarget = { ...target };

      if (newTarget.type && newTarget.type === 'checkbox') {
        newTarget.checked = !formData[newTarget.name];
      }

      setForm({ target: newTarget });
    };

    return (
      <Col className="shadow-identity-cards" lg="6" onClick={setFormCheck}>
        <SVGLayer blob={blob} dancer={dancer} />
        <div>
          <p>{text}</p>
          <div>{input}</div>
        </div>
      </Col>
    );
  };

  const cards = [
    [
      {
        blob: Green_blob,
        dancer: Individual_Dancer,
        text: <span>An Individual</span>,
        setForm,
        target: {
          name: 'landingType',
          value: 'individual'
        },
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
        setForm,
        target: {
          name: 'landingType',
          value: 'group'
        },
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
        setForm,
        target: {
          name: 'landingPerformTypeOnStage',
          type: 'checkbox',
          value: 'on-stage'
        },
        input: (
          <ToggleButton
            checked={landingPerformTypeOnStage}
            name="landingPerformTypeOnStage"
            onChange={setForm}
            type="checkbox"
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
        setForm,
        target: {
          name: 'landingPerformTypeOffStage',
          type: 'checkbox',
          value: 'off-stage'
        },
        input: (
          <ToggleButton
            checked={landingPerformTypeOffStage}
            name="landingPerformTypeOffStage"
            onChange={setForm}
            type="checkbox"
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
            {(cards as any)[landingStep - 1].map((card: any, i: any) => {
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
            onClick={
              landingStep === 2 || landingType === 'group'
                ? next
                : () => setLandingStep(2)
            }
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
