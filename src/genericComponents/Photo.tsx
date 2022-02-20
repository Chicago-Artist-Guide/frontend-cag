import React from 'react';
import styled from 'styled-components';

const Photo = (props: any) => {
  const { src, text, title } = props;

  return (
    <PhotoHolder>
      <img alt={text} src={src} title={title} />
    </PhotoHolder>
  );
};

const PhotoHolder = styled.div`
  height: 95px;
  width: 95px;
  overflow: hidden;
  opacity: 0.7;
  transition: opacity 0.3s linear;
  cursor: pointer;
  --radius: 1rem;
  border-radius: var(--radius);
  img {
    width: 95px;
    height: auto;
  }

  &:hover {
    opacity: 1;
  }
`;

export default Photo;
