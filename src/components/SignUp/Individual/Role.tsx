import clsx from 'clsx';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import BothStage from '../../../images/icons-signup/both-stage.svg';
import OffStage from '../../../images/icons-signup/off-stage.svg';
import OnStage from '../../../images/icons-signup/on-stage.svg';
import { Tagline, Title } from '../../layout/Titles';
import {
  CardHeading,
  CardText,
  SelectDirections,
  StyledCard
} from '../SignUpStyles';
import type { IndividualData, IndividualRoles } from './types';

interface Card {
  icon: string;
  className: string;
  name: IndividualRoles;
  text: JSX.Element;
}

const cards: Card[] = [
  {
    icon: OnStage,
    className: 'green-shadow-hover',
    name: 'on-stage',
    text: (
      <>
        <CardHeading>On-Stage</CardHeading> <p>(Actors, Singers, Dancers)</p>
      </>
    )
  },
  {
    icon: OffStage,
    className: 'blue-shadow-hover',
    name: 'off-stage',
    text: (
      <>
        <CardHeading>Off-Stage</CardHeading> <p>(Directors, Designers, Crew)</p>
      </>
    )
  },
  {
    icon: BothStage,
    className: 'red-shadow-hover',
    name: 'both-stage',
    text: (
      <>
        <CardHeading>Both</CardHeading> <p>All of the Above</p>
      </>
    )
  }
];

const IndividualRole: React.FC<{
  setForm: SetForm;
  formData: IndividualData;
}> = ({ setForm, formData }) => {
  const { stageRole } = formData;
  return (
    <Container className="margin-container">
      <Row>
        <Col lg={12}>
          <Title>WHERE DO YOU PERFORM?</Title>
          <Tagline>On-Stage? Off-Stage? Both?</Tagline>
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
            {cards.map(({ name, icon, text, className }) => (
              <StyledCard
                key={`card-${name}`}
                className={clsx(className, stageRole === name && 'selected')}
                lg="5"
                onClick={() =>
                  setForm({ target: { name: 'stageRole', value: name } })
                }
              >
                <Image alt="" src={icon} />
                <CardText>{text}</CardText>
              </StyledCard>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default IndividualRole;
