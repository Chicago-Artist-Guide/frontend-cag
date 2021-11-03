import React from 'react';
import styled from 'styled-components';

const BlobBox = (props: any) => {
  const { blobs } = props;
  return (
    <Blobs>
      {blobs.map((blob: any) => (
        <img
          alt=""
          key={blob.id}
          src={blob.blob}
          style={{
            inset: blob.inset,
            opacity: blob.opacity,
            transform: blob.transform
          }}
        />
      ))}
    </Blobs>
  );
};

const Blobs = styled.div`
  max-width: 100vw;
  overflow-x: hidden;
  z-index: -9;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  img {
    position: absolute;
    z-index: -10;
  }
`;

export default BlobBox;
