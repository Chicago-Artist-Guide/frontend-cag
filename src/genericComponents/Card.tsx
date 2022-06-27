import React from "react";
import { Card as BSCard } from "react-bootstrap";
import styled from "styled-components";
import DividerBar from "./DividerBar";

const Card = (props: any) => {
  const { header, src, text } = props;
  return (
    <CAGCard>
      <CardBody>
        <SVGHolder>
          <img alt="" src={src} />
        </SVGHolder>
        <DividerBar
          style={{
            backgroundColor: "#000000"
          }}
        />
        <h3>{header}</h3>
        <p>{text}</p>
      </CardBody>
    </CAGCard>
  );
};

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  left: 20px;
  width: 215px;
  position: relative;

  h3 {
    line-height: 26px;
    letter-spacing: .07em;
`;

const CAGCard = styled(BSCard)`
  position: relative;
  right: 0.37%;
  bottom: 0.35%;
  height: 352px;
  border-radius: 8px;
  background-color: #ffffff;
  blend-mode: pass-through;
  backdrop-filter: blur(15px);
  box-shadow: 0px 0px 12px 3px rgba(0, 0, 0, 0.1);
`;

const SVGHolder = styled.div`
  margin-top: 40px;
`;

export default Card;
