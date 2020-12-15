import React from "react";

const SVGLayer = (props: any) => {
  const { blob, dancer } = props;

  return (
    <>
      <img alt="" className="bottom-img" src={blob} />
      <img alt="" className="top-img" src={dancer} />
    </>
  );
};

export default SVGLayer;
