import React from "react";
import styled from "styled-components";
import Photo from "../../genericComponents/Photo";
import { Birkner } from "../../images/who-we-are/operations";

const PhotoContainer = (props: any) => {
  const { photos } = props;

  function handleClick(e: any) {
    let clicked = e.target.src;
    let swap = document.getElementById("main")?.getAttribute("src");
    console.log("Clicked on: " + clicked + "\nSwapped with: " + swap);
    document.getElementById("main")?.setAttribute("src", clicked);
    e.target.src = swap;
  }

  return (
    <PhotoRowContainer onClick={handleClick}>
      <MainPic>
        <img alt="Main" id="main" src={Birkner} />
      </MainPic>
      <Row>
        {photos.map((photo: any) => (
          <Photo
            alt={photo.alt}
            key={photo.id}
            src={photo.src}
            title={photo.title}
          />
        ))}
      </Row>
    </PhotoRowContainer>
  );
};

const PhotoRowContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
`;

const MainPic = styled.div`
  img {
    max-width: 450px;
    height: auto;
  }
`;

const Row = styled.div`
  max-width: 425px;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: 0.35rem;
  margin: 1rem 0;
  align-items: center;
`;

export default PhotoContainer;
