import React from 'react';
const SVGLayer = (props: any) => {
  const { blob, image } = props;

  return (
    <>
      <img alt="" src={blob} className="absolute" />
      <img alt="" src={image} className="relative" />
    </>
  );
};
export default SVGLayer;
