import React from 'react';
import styled from 'styled-components';

const BlobBox = (props: any) => {
  const { blobs } = props;
  return (
    <Blobs>
      {blobs.map((blob: any) => (
        <div>
          <img
            alt=""
            key={blob.id}
            src={blob.blob}
            style={{
              opacity: blob.opacity,
              transform: blob.transform,
              translate: blob.translate
            }}
          />
        </div>
      ))}
    </Blobs>
  );
};

const Blobs = styled.div`
  max-width: 100vw;
  overflow-x: hidden;
  img {
    z-index: -10;
    position: absolute;
    overflow: visible;
  }
`;

export default BlobBox;
