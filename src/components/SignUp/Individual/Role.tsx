import clsx from 'clsx';
import React from 'react';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import BothStage from '../../../images/icons-signup/both-stage.svg';
import OffStage from '../../../images/icons-signup/off-stage.svg';
import OnStage from '../../../images/icons-signup/on-stage.svg';
import type { IndividualData, IndividualRoles } from './types';

// Mobile-first styled components
const RoleCardHeading = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2f4550;
  margin-bottom: 8px;

  @media (min-width: 640px) {
    font-size: 1.375rem;
    margin-bottom: 12px;
  }

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const RoleCardDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  margin: 0;

  @media (min-width: 640px) {
    font-size: 1rem;
    line-height: 1.5;
  }
`;

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
        <RoleCardHeading>On-Stage</RoleCardHeading>
        <RoleCardDescription>(Actors, Singers, Dancers)</RoleCardDescription>
      </>
    )
  },
  {
    icon: OffStage,
    className: 'blue-shadow-hover',
    name: 'off-stage',
    text: (
      <>
        <RoleCardHeading>Off-Stage</RoleCardHeading>
        <RoleCardDescription>(Directors, Designers, Crew)</RoleCardDescription>
      </>
    )
  },
  {
    icon: BothStage,
    className: 'red-shadow-hover',
    name: 'both-stage',
    text: (
      <>
        <RoleCardHeading>Both</RoleCardHeading>
        <RoleCardDescription>All of the Above</RoleCardDescription>
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
    <Container>
      <HeaderSection>
        <RoleTitle>WHERE DO YOU PERFORM?</RoleTitle>
        <Tagline>On-Stage? Off-Stage? Both?</Tagline>
        <DividerBar />
      </HeaderSection>

      <SelectionSection>
        <Instructions>Select one to continue</Instructions>
        <RoleCardsGrid>
          {cards.map(({ name, icon, text, className }) => (
            <RoleCard
              key={`card-${name}`}
              className={clsx(className, stageRole === name && 'selected')}
              onClick={() =>
                setForm({ target: { name: 'stageRole', value: name } })
              }
            >
              <RoleIcon src={icon} alt="" />
              <RoleContent>{text}</RoleContent>
            </RoleCard>
          ))}
        </RoleCardsGrid>
      </SelectionSection>
    </Container>
  );
};

export default IndividualRole;

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

const RoleTitle = styled.h1`
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

const RoleCardsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 700px;
  margin: 0 auto;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 24px;
    max-width: 900px;
  }

  @media (min-width: 1024px) {
    gap: 32px;
  }
`;

const RoleCard = styled.div`
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
  min-height: 180px;

  @media (min-width: 640px) {
    padding: 32px;
    min-height: 200px;
  }

  @media (min-width: 768px) {
    flex: 1;
    min-height: 220px;
  }

  &:hover {
    transform: translateY(-2px);
  }

  &.selected {
    border-width: 3px;
  }

  &.green-shadow-hover {
    &:hover {
      border-color: #82b29a;
      box-shadow: 0 8px 20px rgba(130, 178, 154, 0.25);
    }

    &.selected {
      border-color: #82b29a;
      background: rgba(130, 178, 154, 0.1);
      box-shadow: 0 4px 12px rgba(130, 178, 154, 0.2);
    }
  }

  &.blue-shadow-hover {
    &:hover {
      border-color: #355669;
      box-shadow: 0 8px 20px rgba(53, 86, 105, 0.25);
    }

    &.selected {
      border-color: #355669;
      background: rgba(53, 86, 105, 0.1);
      box-shadow: 0 4px 12px rgba(53, 86, 105, 0.2);
    }
  }

  &.red-shadow-hover {
    &:hover {
      border-color: #e57f78;
      box-shadow: 0 8px 20px rgba(229, 127, 120, 0.25);
    }

    &.selected {
      border-color: #e57f78;
      background: rgba(229, 127, 120, 0.1);
      box-shadow: 0 4px 12px rgba(229, 127, 120, 0.2);
    }
  }
`;

const RoleIcon = styled.img`
  width: 60px;
  height: 60px;
  margin-bottom: 20px;

  @media (min-width: 640px) {
    width: 80px;
    height: 80px;
    margin-bottom: 24px;
  }
`;

const RoleContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
