import React from "react";
import styled from "styled-components";
import Photo from "../../genericComponents/Photo";
import { Birkner } from "../../images/who-we-are/operations";

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
  max-width: 312px;

  img {
    max-width: inherit;
  }
`;

const Ring = styled.div`
  width: 100%;
  transform-style: preserve-3d;
`;

export default PhotoRing;
