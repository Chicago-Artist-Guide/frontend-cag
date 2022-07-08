import clsx from 'clsx';
import React from 'react';
import { Container, Image } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
import Group from '../../images/icons-signup/group.svg';
import Individual from '../../images/icons-signup/individual.svg';
import { fonts } from '../../theme/styleVars';
import { Tagline, Title } from '../layout';
import { CardHeading, StyledCard, CardText } from './SignUpStyles';

type Card = {
  icon: string;
  className: string;
  name: string;
  text: React.ReactNode;
};

type Props = {
  accountType: string | null;
  setAccountType: (x: 'individual' | 'group' | null) => void;
};

const AccountType: React.FC<Props> = ({ accountType, setAccountType }) => {
  return (
    <Container className="margin-container">
      <Row>
        <Col lg={12}>
          <Title>BUILD CONNECTIONS TODAY</Title>
          <Tagline>Join the community today for new opportunities.</Tagline>
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
            {cards.map(({ className, icon, text, input, name }: any) => (
              <StyledCard
                key={name}
                className={clsx(className, accountType === name && 'selected')}
                lg="5"
                onClick={() => setAccountType(name)}
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

export default AccountType;

const SelectDirections = styled.p`
  text-align: left;
  font-size: 14px/18px;
  letter-spacing: 0.14px;
  font: ${fonts.montserrat};
`;

const cards: Card[] = [
  {
    icon: Individual,
    className: 'green-shadow-hover',
    name: 'individual',
    text: (
      <>
        <CardHeading>Individual Artist</CardHeading>{' '}
        <p>Show off your skills and experience</p>
      </>
    )
  },
  {
    icon: Group,
    className: 'red-shadow-hover',
    name: 'group',
    text: (
      <>
        <CardHeading>Theatre Group</CardHeading>
        <p>
          Urna gravida tellus nullam nulla. Tempor sollicitudin sed sed enim
          morbi amet bibendum massa. Consequat feugiat in pulvinar id egestas.
        </p>
      </>
    )
  }
];
