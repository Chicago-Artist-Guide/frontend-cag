import React from 'react';
import styled from 'styled-components';
//TODO: Add a placeholder image to import

const Photo = (props: any) => {
  const { src, text } = props;
  return (
    <PhotoContainer>
      <PhotoHolder>
        <img alt={text} src={src} />
      </PhotoHolder>
    </PhotoContainer>
  );
};

const PhotoContainer = styled.div`
  perspective: 2000px;
  width: 350px;
  height: 900px;
`;

const PhotoHolder = styled.div`
  width: 100%;
  transform-style: preserve-3d;

  img {
    max-width: 95px;
    transform-style: preserve-3d;
  }
`;

export default Photo;
