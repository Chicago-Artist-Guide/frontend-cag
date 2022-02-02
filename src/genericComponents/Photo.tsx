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
  width: 95px;
`;

const PhotoHolder = styled.div`
  max-height: 95px;
  overflow: hidden;

  img {
    max-width: 95px;
  }
`;

export default Photo;
