import React from 'react';
import styled from 'styled-components';
import { colors } from '../../theme/styleVars';

const QandA = (props: any) => {
  return (
    <div className="" key={props.id}>
      <div className="mb-[2rem] mt-[1rem]">
        <Question>{props.question}</Question>
        <p>{props.answer}</p>
      </div>
    </div>
  );
};
const Question = styled.div`
  font-weight: 700;
  font-color: ${colors.dark};
  text-transform: uppercase;
`;

export default QandA;
