import React from 'react';
import { colors } from '../theme/styleVars';
//import { Card as BSCard } from 'react-bootstrap';
import styled from 'styled-components';
//import DividerBar from './DividerBar';

const FAQCard = (props: any) => {
  const { faqs } = props;
  return (
    <CardBody>
      <Question>
        <h3>{faqs.question}</h3>
      </Question>
      {vars.easing}
    </CardBody>
  );
};

const vars = {
  easing: 'cubic - bezier(0.645, 0.045, 0.355, 1)'
};

const CardBody = styled.div`
  margin-top: 4rem;
`;

const Question = styled.div`
  font-weight: 700;
  font-color: ${colors.dark};
  text-transform: uppercase;
`;

export default FAQCard;
