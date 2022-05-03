import React from 'react';
import styled from 'styled-components';
//import Button from '../../../genericComponents/Button';

const TrainingText = (props: any) => {
  // const { text } = props;
  return (
    <TextBody>
      <>
        <h2>Training</h2>
        <h3>University of Illinois</h3>
        Champaign, IL - <i>BFS, Theater 2002-2006</i>
        <br />
        Studies were focused on theatrical production.
      </>
    </TextBody>
  );
};

const TextBody = styled.div`
  position: relative;
  padding: 20px;
`;

export default TrainingText;
