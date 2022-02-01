import React from 'react';
import styled from 'styled-components';
<<<<<<< HEAD

const Photo = (props: any) => {
  const { src, text, title } = props;

  return (
    <PhotoHolder>
      <img alt={text} src={src} title={title} />
    </PhotoHolder>
  );
};

const PhotoHolder = styled.div`
  height: 125px;
  width: 125px;
  overflow: hidden;
  opacity: 0.7;
  transition: opacity 0.3s linear;
  cursor: pointer;
  --radius: 0.5rem;
  border-radius: var(--radius);
  img {
    width: 125px;
    height: auto;
  }

  &:hover {
    opacity: 1;
=======
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
>>>>>>> bf02689 (Created generic and specific components; created ops index for easier photo export-import; sized photo and details columns, main photo)
  }
`;

export default Photo;
