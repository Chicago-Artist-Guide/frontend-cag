import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Image from 'react-bootstrap/Image';
import { Tagline, Title } from '../layout/Titles';
import Green_blob from '../../images/green_blob.svg';
import Red_blob from '../../images/red_blob.svg';

const Landing: React.FC<{
  setForm: any;
  formData: any;
  landingStep: any;
  setLandingStep: any;
}> = ({ setForm, formData, landingStep, setLandingStep }) => {
  const {
    landingType,
    landingPerformTypeOnStage,
    landingPerformTypeOffStage
  } = formData;

  const Card: React.FC<{
    blob: any;
    setForm: any;
    target: any;
    text: any;
    input: any;
    key: string;
  }> = ({ blob, setForm, target, text, input }) => {
    const setFormCheck = () => {
      const newTarget = { ...target };

      if (newTarget.type && newTarget.type === 'checkbox') {
        newTarget.checked = !formData[newTarget.name];
      }

      setForm({ target: newTarget });
    };

    return (
      <Col className="shadow-identity-cards" lg="6" onClick={setFormCheck}>
        <Image alt="" src={blob} />
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
    </Container>
  );
};

export default Landing;
