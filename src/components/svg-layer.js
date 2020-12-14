import React from 'react';

function SVGLayer(props) {
  return (
      <>
        <img className="bottom-img" src={props.blob} alt=""/>
        <img className="top-img" src={props.dancer} alt=""/>
      </>
);
}

export default SVGLayer;
