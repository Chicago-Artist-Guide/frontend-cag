import React from 'react';
import styled from 'styled-components';
//import Button from '../../../genericComponents/Button';

const AdditionalSkills = (props: any) => {
  // const { text } = props;
  return (
    <TextBody>
      <>
        <h2>Additional Skills</h2>
        <TagCloud>
          <ul>
            <li>
              <a href="">high resolution</a>
            </li>
            <li>
              <a href="">icons</a>
            </li>
            <li>
              <a href="">layer styles</a>
            </li>
            <li>
              <a href="">layout</a>
            </li>
            <li>
              <a href="">letterpress</a>
            </li>
            <li>
              <a href="">magazine</a>
            </li>
            <li>
              <a href="">menu</a>
            </li>
          </ul>
        </TagCloud>
      </>
    </TextBody>
  );
};

const TextBody = styled.div`
  position: relative;
  padding: 20px;
`;

const TagCloud = styled.div`
  width: inherit;
  margin: auto;
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    margin: 5px 5px 5px 5px;
    float: left;
  }
  a {
    display: inline-block;
    position: relative;
    color: #996633;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
    text-decoration: none;
    text-align: center;
    padding: 4px 9px 6px 9px;
    border-radius: 15px;
    border: 1px solid #cc912d;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2),
      0 1px 0px rgba(255, 255, 255, 0.4) inset;
    background-image: linear-gradient(
      top,
      rgba(254, 218, 113, 1) 0%,
      rgba(254, 205, 97, 1) 60%,
      rgba(254, 188, 74, 1) 100%
    );
  }
  a:hover {
    color: #492a0b;
  }
`;

export default AdditionalSkills;
