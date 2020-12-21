import React from 'react';
import styled from 'styled-components';

const SVGLayer = (props: any) => {
  const { blob, dancer } = props;

  return (
    <>
      <BottomImg alt="" src={blob} />
      <TopImg alt="" src={dancer} />
    </>
  );
};

const BottomImg = styled.img`
  position: absolute;
`;

const TopImg = styled.img`
  position: relative;
`;

export default SVGLayer;
