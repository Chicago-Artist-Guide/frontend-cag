import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import SVGLayer from '../../components/svg-layer';

function Holder1(props) {
  return (
    <Row>
      <Col lg={7}>
        <h3 className="subtitle">{props.greeting}</h3>
        <h1 className="title">{props.title}</h1>
        <h2 className="tagline">{props.tagline}</h2>
        {props.comp}
      </Col>
      <Col lg={5}>
      <SVGLayer blob={props.blob} dancer={props.dancer}/>
      </Col>
    </Row>
);
}

export default Holder1;
