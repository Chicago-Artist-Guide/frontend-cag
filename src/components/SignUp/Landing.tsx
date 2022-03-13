import React from 'react';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Image from 'react-bootstrap/Image';
import { Tagline, Title } from '../layout/Titles';
import { cardHeight, colors, fonts } from '../../theme/styleVars';
import Group from '../../images/icons-signup/group.svg';
import Individual from '../../images/icons-signup/individual.svg';
import OnStage from '../../images/icons-signup/on-stage.svg';
import OffStage from '../../images/icons-signup/off-stage.svg';
import BothStage from '../../images/icons-signup/both-stage.svg';
import { Link } from 'react-router-dom';

const Landing: React.FC<{
  setForm: any;
  formData: any;
  landingStep: any;
  setLandingStep: any;
}> = ({ setForm, formData, landingStep, setLandingStep }) => {
  const { landingType, stageRole } = formData;

  const Card: React.FC<{
    icon: any;
    className: string;
    name: string;
    setForm: any;
    target: any;
    text: any;
    input: any;
    key: string;
  }> = ({ icon, className, name, setForm, target, text, input }) => {
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
      selected = stageRole === name;
    }

    return (
      <StyledCard
        className={`${className} ${selected ? 'selected' : ''}`}
        lg="5"
        onClick={setFormCheck}
      >
        <Image alt="" src={icon} />
        <CardText>
          {text}
          {input}
        </CardText>
      </StyledCard>
    );
  };

  const cards = [
    [
      {
        icon: Individual,
        className: 'green-shadow-hover',
        name: 'individual',
        text: (
          <>
            <CardHeading>Individual Artist</CardHeading>{' '}
            <p>Show off your skills and experience</p>
          </>
        ),
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
        icon: Group,
        className: 'red-shadow-hover',
        name: 'group',
        text: (
          <>
            <CardHeading>Theatre Group</CardHeading>{' '}
            <p>
              Urna gravida tellus nullam nulla. Tempor sollicitudin sed sed enim
              morbi amet bibendum massa. Consequat feugiat in pulvinar id
              egestas.
            </p>
          </>
        ),
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
        icon: OnStage,
        className: 'green-shadow-hover',
        name: 'on-stage',
        text: (
          <>
            <CardHeading>On-Stage</CardHeading>{' '}
            <p>(Actors, Singers, Dancers)</p>
          </>
        ),
        setForm,
        target: {
          name: 'stageRole',
          value: 'on-stage'
        },
        input: (
          <ToggleButton
            checked={stageRole === 'on-stage'}
            name="stageRole"
            onChange={setForm}
            type="radio"
            value="on-stage"
          />
        )
      },
      {
        icon: OffStage,
        className: 'blue-shadow-hover',
        name: 'off-stage',
        text: (
          <>
            <CardHeading>Off-Stage</CardHeading>{' '}
            <p>(Directors, Designers, Crew)</p>
          </>
        ),
        setForm,
        target: {
          name: 'stageRole',
          value: 'off-stage'
        },
        input: (
          <ToggleButton
            checked={stageRole === 'off-stage'}
            name="stageRole"
            onChange={setForm}
            type="radio"
            value="off-stage"
          />
        )
      },
      {
        icon: BothStage,
        className: 'red-shadow-hover',
        name: 'both-stage',
        text: (
          <>
            <CardHeading>Both</CardHeading>{' '}
            <p>(Directors, Designers, Dancers)</p>
          </>
        ),
        setForm,
        target: {
          name: 'stageRole',
          value: 'both-stage'
        },
        input: (
          <ToggleButton
            checked={stageRole === 'both-stage'}
            name="stageRole"
            onChange={setForm}
            type="radio"
            value="both-stage"
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
              ? 'Join the community today for new opportunities.'
              : 'On-Stage? Off-Stage? Both?'}
          </Tagline>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <SelectDirections>Select one to continue</SelectDirections>
        </Col>
      </Row>
      <Row>
        <Col lg={7}>
          <Row style={{ flexWrap: 'nowrap' }}>
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
  width: 273px;
  height: ${cardHeight};
  margin-left: 14px;
  margin-right: 6px;
  box-shadow: 2px 2px 10px rgba(0, 0, 29, 0.1);
  border-radius: 8px;
  background-color: ${colors.bodyBg};
  backdrop-filter: blur(15px);
  padding: 30px 20px 50px 20px;
  transition: all 0.1s ease-in-out;

  p {
    font-size: 20px;
    line-height: 24px;
    /* or 150% */
    letter-spacing: 0.5px;

    /* Inside Auto Layout */
    flex: none;
    order: 2;
    flex-grow: 0;
    margin: 12px 0px;
  }

  &:hover {
    scale: 1.05;
    cursor: pointer;

    &.blue-shadow-hover {
      box-shadow: 2px 2px 10px rgba(53, 86, 105, 0.65);
      &.selected {
        background: rgba(53, 86, 105, 0.65);
      }
    }

    &.green-shadow-hover {
      box-shadow: 2px 2px 10px rgba(149, 189, 168, 0.99);
      &.selected {
        background: rgba(149, 189, 168, 0.99);
      }
    }

    &.red-shadow-hover {
      box-shadow: 2px 2px 10px rgba(229, 143, 120, 0.65);
      &.selected {
        background: rgba(229, 143, 120, 0.65);
      }
    }
  }

  &.selected {
    &.blue-shadow-hover {
      background: rgba(53, 86, 105, 0.65);
    }

    &.green-shadow-hover {
      background: rgba(149, 189, 168, 0.99);
    }

    &.red-shadow-hover {
      background: rgba(229, 143, 120, 0.65);
    }
  }

  label {
    display: none;
  }
`;

const SelectDirections = styled.p`
  text-align: left;
  font-size: 14px/18px;
  letter-spacing: 0.14px;
  font: ${fonts.montserrat};
`;

const LoginLink = styled.p`
  text-align: left;
  font-family: Montserrat;
  font-size: 14px/18px;
  letter-spacing: 0.14px;
  margin-top: 40px;

  a {
    color: ${colors.cornflower};
  }
`;

const CardHeading = styled.h3`
  width: 225px;
  font: ${fonts.montserrat}
  font-weight: 500;
  font-size: 24px;
  line-height: 28px;
  /* identical to box height, or 117% */
  letter-spacing: 0.07em;
  margin: 12px 0px;
`;

const CardText = styled.div`
  height: calc(${cardHeight} / 2);
  margin-top: 5px;
  overflow: auto;
`;

export default Landing;
