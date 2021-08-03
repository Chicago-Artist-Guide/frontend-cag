import React from 'react';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Image from 'react-bootstrap/Image';
import { Tagline, Title } from '../layout/Titles';
import { colors } from '../../theme/styleVars';
import Green_blob from '../../images/green_blob.svg';
import Red_blob from '../../images/red_blob.svg';
import Blue_blob from '../../images/blue_blob.svg';
import { Link } from 'react-router-dom';

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
    className: string;
    name: string;
    setForm: any;
    target: any;
    text: any;
    input: any;
    key: string;
  }> = ({ blob, className, name, setForm, target, text, input }) => {
    const setFormCheck = () => {
      const newTarget = { ...target };

      if (newTarget.type && newTarget.type === 'checkbox') {
        newTarget.checked = !formData[newTarget.name];
      }

      setForm({ target: newTarget });
    };

    let selected = false;

    if (landingStep === 1) {
      selected = landingType === name;
    } else {
      selected =
        target.name === 'landingPerformTypeOnStage'
          ? landingPerformTypeOnStage
          : landingPerformTypeOffStage;
    }

    return (
      <StyledCard
        className={`${className} ${selected ? 'selected' : ''}`}
        lg="5"
        onClick={setFormCheck}
      >
        <Image alt="" src={blob} />
        <div>
          <p>{text}</p>
          <div>{input}</div>
        </div>
      </StyledCard>
    );
  };

  const cards = [
    [
      {
        blob: Green_blob,
        className: 'green-shadow-hover',
        name: 'individual',
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
        className: 'red-shadow-hover',
        name: 'group',
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
        className: 'green-shadow-hover',
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
        blob: Blue_blob,
        className: 'blue-shadow-hover',
        text: (
          <span>
            <strong>Off-Stage</strong> (Directors, Designers, Crew)
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
              ? 'Join the community today for new opportunities'
              : 'On-Stage? Off-Stage? Both?'}
          </Tagline>
        </Col>
      </Row>
      <Row>
        <Col lg={7}>
          <Row>
            {(cards as any)[landingStep - 1].map((card: any, i: any) => {
              return <Card {...card} key={`card-${landingStep}-${i}`} />;
            })}
          </Row>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <LoginLink>
            Already a member? <Link to="/login">Log in here</Link>
          </LoginLink>
        </Col>
      </Row>
    </Container>
  );
};

const StyledCard = styled(Col)`
  margin-right: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 29, 0.1);
  border-radius: 8px;
  background-color: ${colors.bodyBg};
  padding: 30px 20px 50px 20px;
  height: 100%;

  &:hover,
  &.selected {
    cursor: pointer;

    &.blue-shadow-hover {
      box-shadow: 2px 2px 10px rgba(53, 86, 105, 0.65);
    }

    &.green-shadow-hover {
      box-shadow: 2px 2px 10px rgba(149, 189, 168, 0.99);
    }

    &.red-shadow-hover {
      box-shadow: 2px 2px 10px rgba(229, 143, 120, 0.65);
    }
  }

  &.selected {
    font-weight: bold;
  }

  > div > div {
    display: none;
  }

  p {
    font-size: 20px;
    text-align: center;
  }
`;

const LoginLink = styled.p`
  text-align: left;
  font-size: 14px/18px;
  font-style: italic;
  letter-spacing: 0.14px;
  margin-top: 40px;

  a {
    color: ${colors.orange};
  }
`;

export default Landing;
