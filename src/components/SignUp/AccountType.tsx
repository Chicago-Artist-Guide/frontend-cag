import clsx from 'clsx';
import React from 'react';
import { Container, Image } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Group from '../../images/icons-signup/group.svg';
import Individual from '../../images/icons-signup/individual.svg';
import { colors, fonts } from '../../theme/styleVars';
import { Tagline, Title } from '../layout';
import { CardHeading, CardText, StyledCard } from './SignUpStyles';
import type { AccountTypeOptions } from './types';

type Card = {
  icon: string;
  className: string;
  name: string;
  text: React.ReactNode;
};

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
    name: 'company',
    text: (
      <>
        <CardHeading>Theatre Group</CardHeading>
        <p>
          Request a registration link through this form to start posting your
          jobs
        </p>
      </>
    )
  }
];

type Props = {
  accountType: string | null;
  setAccountType: (x: AccountTypeOptions | null) => void;
  onCardClick?: () => void;
};

const AccountType: React.FC<Props> = ({
  accountType,
  setAccountType,
  onCardClick
}) => {
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
            {cards.map(({ className, icon, text, name }: any) => (
              <StyledCard
                key={name}
                className={clsx(className, accountType === name && 'selected')}
                lg="5"
                onClick={() => {
                  setAccountType(name);
                  if (onCardClick) {
                    onCardClick();
                  }
                }}
              >
                <Image alt="" src={icon} />
                <CardText>{text}</CardText>
              </StyledCard>
            ))}
          </Row>
        </Col>
      </Row>
      <Row>
        <Col lg="12">
          <LoginLink>
            Already a member? <Link to="/login">Log in here</Link>
          </LoginLink>
        </Col>
      </Row>
    </Container>
  );
};

const SelectDirections = styled.p`
  text-align: left;
  font-size: 14px/18px;
  letter-spacing: 0.14px;
  font: ${fonts.montserrat};
`;

const LoginLink = styled.p`
  text-align: left;
  font-size: 14px/18px;
  font-style: italic;
  letter-spacing: 0.14px;
  margin-top: 40px;
  margin-bottom: -40px;

  a {
    color: ${colors.salmon};
  }
`;

export default AccountType;
