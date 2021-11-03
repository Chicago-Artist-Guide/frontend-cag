import React from 'react';
import styled from 'styled-components';
import Card from '../../genericComponents/Card';

const CardBox = (props: any) => {
  const { cards } = props;
  return (
    <Cards>
      {cards.map((cards: any) => (
        <Card
          divider={cards.divider}
          header={cards.header}
          src={cards.image}
          text={cards.text}
        />
      ))}
    </Cards>
  );
};

const Cards = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 850px;
  row-gap: 25px;
  column-gap: 32px;
  margin-left: 70px;

  .card:nth-of-type(2) {
    margin-bottom: 75px;
  }
  .card:nth-of-type(3) {
    margin-top: 75px;
  }
`;

export default CardBox;