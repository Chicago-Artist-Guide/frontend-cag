import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Group from '../../images/icons-signup/group.svg';
import Individual from '../../images/icons-signup/individual.svg';
import { colors } from '../../theme/styleVars';
import type { AccountTypeOptions } from './types';

// Styled components first
const CardHeading = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2f4550;
  margin-bottom: 12px;

  @media (min-width: 640px) {
    font-size: 1.375rem;
    margin-bottom: 16px;
  }

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CardDescription = styled.p`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  margin: 0;

  @media (min-width: 640px) {
    font-size: 1rem;
    line-height: 1.6;
  }
`;

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
        <CardHeading>Individual Artist</CardHeading>
        <CardDescription>Show off your skills and experience</CardDescription>
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
        <CardDescription>
          Request a registration link through this form to start posting your
          jobs
        </CardDescription>
      </>
    )
  }
];

type Props = {
  accountType: string | null;
  setAccountType: (type: AccountTypeOptions) => void;
  onCardClick?: () => void;
};

const AccountType: React.FC<Props> = ({
  accountType,
  setAccountType,
  onCardClick
}) => {
  return (
    <Container>
      <HeaderSection>
        <Title>BUILD CONNECTIONS TODAY</Title>
        <Tagline>Join the community today for new opportunities.</Tagline>
        <DividerBar />
      </HeaderSection>

      <SelectionSection>
        <Instructions>Select one to continue</Instructions>
        <CardsContainer>
          {cards.map(({ className, icon, text, name }) => (
            <AccountCard
              key={name}
              className={clsx(className, accountType === name && 'selected')}
              onClick={() => {
                setAccountType(name as AccountTypeOptions);
                if (onCardClick) {
                  onCardClick();
                }
              }}
            >
              <CardIcon src={icon} alt="" />
              <CardContent>{text}</CardContent>
            </AccountCard>
          ))}
        </CardsContainer>
      </SelectionSection>

      <FooterSection>
        <LoginLink>
          Already a member? <Link to="/login">Log in here</Link>
        </LoginLink>
      </FooterSection>
    </Container>
  );
};

export default AccountType;

const Container = styled.div`
  max-width: 100%;
  padding: 0 16px;

  @media (min-width: 640px) {
    padding: 0 24px;
  }

  @media (min-width: 768px) {
    padding: 0 32px;
  }

  @media (min-width: 1024px) {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 48px;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 48px;

  @media (min-width: 768px) {
    margin-bottom: 64px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #2f4550;
  text-transform: uppercase;

  @media (min-width: 640px) {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }

  @media (min-width: 768px) {
    font-size: 3rem;
    margin-bottom: 24px;
  }
`;

const Tagline = styled.h2`
  font-size: 1.125rem;
  font-weight: 400;
  margin-bottom: 32px;
  color: #666;

  @media (min-width: 640px) {
    font-size: 1.25rem;
    margin-bottom: 40px;
  }

  @media (min-width: 768px) {
    font-size: 1.375rem;
  }
`;

const DividerBar = styled.div`
  width: 100%;
  max-width: 200px;
  height: 3px;
  border-radius: 2px;
  margin: 0 auto;
  background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);

  @media (min-width: 640px) {
    max-width: 250px;
    height: 4px;
  }

  @media (min-width: 768px) {
    max-width: 300px;
  }
`;

const SelectionSection = styled.div`
  margin-bottom: 48px;

  @media (min-width: 768px) {
    margin-bottom: 64px;
  }
`;

const Instructions = styled.p`
  text-align: center;
  font-size: 1rem;
  color: #666;
  margin-bottom: 32px;
  letter-spacing: 0.14px;

  @media (min-width: 640px) {
    font-size: 1.125rem;
    margin-bottom: 40px;
  }
`;

const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 24px;
    max-width: 800px;
  }

  @media (min-width: 1024px) {
    gap: 32px;
  }
`;

const AccountCard = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 200px;

  @media (min-width: 640px) {
    padding: 32px;
    min-height: 220px;
  }

  @media (min-width: 768px) {
    flex: 1;
    min-height: 240px;
  }

  &:hover {
    border-color: #82b29a;
    box-shadow: 0 4px 12px rgba(130, 178, 154, 0.15);
    transform: translateY(-2px);
  }

  &.selected {
    border-color: #82b29a;
    background: #f0f8f4;
    box-shadow: 0 4px 12px rgba(130, 178, 154, 0.2);
  }

  &.green-shadow-hover:hover {
    box-shadow: 0 8px 20px rgba(130, 178, 154, 0.25);
  }

  &.red-shadow-hover:hover {
    box-shadow: 0 8px 20px rgba(225, 123, 96, 0.25);
  }
`;

const CardIcon = styled.img`
  width: 60px;
  height: 60px;
  margin-bottom: 20px;

  @media (min-width: 640px) {
    width: 80px;
    height: 80px;
    margin-bottom: 24px;
  }
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const FooterSection = styled.div`
  text-align: center;
  margin-top: 32px;

  @media (min-width: 768px) {
    margin-top: 48px;
  }
`;

const LoginLink = styled.p`
  font-size: 0.9rem;
  font-style: italic;
  color: #666;
  margin: 0;

  @media (min-width: 640px) {
    font-size: 1rem;
  }

  a {
    color: ${colors.salmon};
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;
