import React from 'react';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import { BlobBox } from '../layout';
import { redBlob, yellowBlob1 } from '../../images';
import { emailWhiteIcon } from '../../images/icons-home';

const EmailList = () => {
  const blobs = [
    {
      id: 1,
      blob: emailWhiteIcon,
      opacity: 1,
      transform: 'scale(1.4)',
      translate: '12vw, 43vh',
      zIndex: '1'
    },
    {
      id: 2,
      blob: yellowBlob1,
      opacity: 0.85,
      transform: 'rotate(315deg) scale(1)',
      translate: '-1vw, 25vh'
    },
    {
      id: 3,
      blob: redBlob,
      opacity: 0.6,
      transform: 'rotate(-7deg) scale(1.1)',
      translate: '-1vw, 20vh'
    }
  ];

  return (
    <InTouchRow>
      <div
        dangerouslySetInnerHTML={{
          __html:
            '<iframe onload="window.parent.scrollTo(0,0)" height="850" allowTransparency="true" allow="payment" frameborder="0" scrolling="no" style="width:100%;border:none" src="https://secure.lglforms.com/form_engine/s/RhWpXILLBg4_95e80UD-IQ"><a href="https://secure.lglforms.com/form_engine/s/RhWpXILLBg4_95e80UD-IQ">Fill out my LGL Form!</a></iframe>'
        }}
      />
      <BlobBox blobs={blobs} />
    </InTouchRow>
  );
};

const InTouchRow = styled(Row)`
  display: grid;
  width: 100%;
  padding: 35px 0;
  margin: 0;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  grid-template-areas: 'formBox imgBox';

  div:nth-child(2),
  div:nth-child(3) {
    grid-area: imgBox;
    transform-style: preserve-3d;
  }
`;

export default EmailList;
