import React from 'react';
import styled from 'styled-components';
import Card from '../../genericComponents/Card';
import { breakpoints } from '../../theme/styleVars';

const CardBox = (props: any) => {
  const { cards } = props;
  return (
    <Cards>
      {cards.map((cards: any) => (
        <Card
          divider={cards.divider}
          header={cards.header}
          key={`${cards.img}-${cards.text}`}
          src={cards.image}
          text={cards.text}
        />
      ))}
    </Cards>
  );
};

const Cards = styled.div`
  row-gap: 25px;
  column-gap: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 35px;

  @media (min-width: ${breakpoints.md}) {
    flex-wrap: wrap;
    padding-top: 0;
    height: 850px;

    .card:nth-of-type(2) {
      margin-bottom: 75px;
    }

    .card:nth-of-type(3) {
      margin-top: 75px;
    }
  }
`;

export default CardBox;
