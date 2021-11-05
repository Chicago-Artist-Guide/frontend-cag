import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import { BlobBox } from '../layout';
import { redBlob, yellowBlob1 } from '../../images';
import { emailWhiteIcon } from '../../images/icons-home';
import { colors } from '../../theme/styleVars';
import { Checkbox, DividerBar, InputField } from '../../genericComponents';

const InTouch = () => {
  const blobs = [
    {
      id: '1',
      blob: emailWhiteIcon,
      opacity: 1,
      transform: 'scale(1.4)',
      translate: '12vw 43vh',
      zIndex: '1'
    },
    {
      id: 2,
      blob: yellowBlob1,
      opacity: 0.85,
      transform: 'rotate(315deg) scale(1)',
      translate: '-1vw 25vh'
    },
    {
      id: 3,
      blob: redBlob,
      opacity: 0.6,
      transform: 'rotate(-7deg) scale(1.1)',
      translate: '-1vw 20vh'
    }
  ];

  return (
    <>
      <InTouchRow>
        <WordBox>
          <DividerBar
            style={{
              backgroundImage:
                'linear-gradient(90deg, #EFC93D 0%, #E17B60 100%)'
            }}
          />
          <h2>STAY IN TOUCH</h2>
          <InputField placeholder="First Name" />
          <InputField placeholder="Last Name" />
          <InputField placeholder="Email Address" />
          <CheckBoxes>
            <div>
              <p>I am a...</p>
              <Checkbox label="Theatre Artist" />
              <Checkbox label="Theatre Administrator" />
              <Checkbox label="Theatre Teacher" />
              <Checkbox label="Other" />
            </div>
            <div>
              <p>I would like emails about...</p>
              <Checkbox label="Hiring/Casting" />
              <Checkbox label="Theatre Resources" />
              <Checkbox label="My Community" />
              <Checkbox label="Chicago Artist Guide Updates" />
            </div>
          </CheckBoxes>
          <BuildButton>
            <Nav.Link as={Link} to="/NotFound">
              SUBSCRIBE
            </Nav.Link>
          </BuildButton>
        </WordBox>
        <BlobBox blobs={blobs} />
      </InTouchRow>
    </>
  );
};

const InTouchRow = styled(Row)`
  display: grid;
  width: 100%;
  height: 960px;
  padding: 35px 0;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: "wordBox cardBox";
  div:nth-child(2),
  div:nth-child(3) {
    grid-area: cardBox;
    transform-style: preserve-3d;
  }
`;

const WordBox = styled.div`
  margin-right: 70px;
  margin-top: 50px;
  padding-top: 20vh;
  grid-area: wordBox;
`;

const CheckBoxes = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: "Iam emails";
  margin-top: 30px;

  div:nth-child(1) {
    grid-area: Iam;
  }
  div:nth-child(2) {
    grid-area: emails;
  }

  div > p {
    font-weight: 600;
  }
`;

const BuildButton = styled(Button)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 18px;
  position: absolute;
  width: 220px;
  height: 40px;
  background: ${colors.mint};
  border-radius: 20px;
  border: none;
  box-shadow: 0px 0px 8px 4px rgba(0, 0, 0, 0.05);

  .nav-link {
    color: #fff;
    flex-shrink: 0;
  }
`;

export default InTouch;
