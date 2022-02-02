import React from 'react';
import styled from 'styled-components';
import Photo from '../../genericComponents/Photo';
import { Birkner } from '../../images/who-we-are/operations';

const PhotoRing = (props: any) => {
  const { photos } = props;

  return (
    <PhotoRingContainer>
      <MainPic>
        <img alt="Main" src={Birkner} />
      </MainPic>
      <Ring>
        {photos.map((photo: any) => (
          <Photo src={photo.src} />
        ))}
      </Ring>
    </PhotoRingContainer>
  );
};

const PhotoRingContainer = styled.div``;

const MainPic = styled.div`
  width: inherit;
  overflow-x: hidden;
`;

const Ring = styled.div`
  width: 100%;
  transform-style: preserve-3d;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  row-gap: 10px;
  margin: 10px 0;
`;

export default PhotoRing;
