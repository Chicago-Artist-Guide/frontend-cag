import React from 'react';
import styled from 'styled-components';
import { Card as BSCard } from 'react-bootstrap';
import DividerBar from '../../genericComponents/DividerBar';

const DetailsCard = (props: any) => {
  const { about } = props;
  return (
    <Details>
      <h3>Personal Details</h3>
      <DividerBar
        style={{
          backgroundImage: 'linear-gradient(90deg,#EFC93D 0%, #82B29A 100%)'
        }}
      />
      {about.map((about: any) => (
        <p>
          Age Range: {about.age} <br />
          Ethnicity: {about.ethnicity} <br />
          Gender: {about.gender} <br />
          Height: {about.height} <br />
          Union: {about.union} <br />
          Agency: {about.agency} <br />
        </p>
      ))}
    </Details>
  );
};

const Details = styled(BSCard)`
	position: relative;
	right: 0.37%;
	bottom: 0.35%;
	border-radius: 8px;
	padding: 20px;
	background-color: #ffffff;
	blend-mode: pass-through;
	backdrop-filter: blur(15px);
	box-shadow: 0px 0px 12px 3px rgba(0, 0, 0, 0.1);
	  h3 {
    line-height: 26px;
    letter-spacing: .07em;
`;

export default DetailsCard;
