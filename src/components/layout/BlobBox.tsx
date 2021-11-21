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
              translate: blob.translate,
              zIndex: blob.zIndex
            }}
          />
        </div>
      ))}
    </Blobs>
  );
};

const Blobs = styled.div`
  z-index: -1;
  transform-style: preserve-3d;
  img {
    position: absolute;
    overflow: visible;
  }
`;

export default BlobBox;
