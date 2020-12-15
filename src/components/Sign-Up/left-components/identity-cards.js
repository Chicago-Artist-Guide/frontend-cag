import React from 'react';
import SVGLayer from '../../svg-layer';
import Row from 'react-bootstrap/Row';
import Nav from "react-bootstrap/Nav";

function IdentityCard(props) {  

  return (
      <Nav.Link href={props.url} id="change-color-nav">
      <Row className="shadow-identity-cards">
            <SVGLayer blob={props.blob} dancer={props.dancer}/>
            <p>{props.text}</p>
      </Row>  
      </Nav.Link>
);
}

export default IdentityCard;