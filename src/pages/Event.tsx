import React from 'react';
import { BlobBox, PageContainer, Tagline, Title } from '../components/layout';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';
import { Image } from 'react-bootstrap';

import Poster from '../images/events/cag-baret.png';
import { redBlob2, yellowBlob1, yellowBlob3 } from '../images';

const event: Event = {
  title: 'A night at the Cag-baret',
  tagline: 'Launch Part Fundraiser'
};

type Event = {
  title: string;
  tagline: string;
};

const EventPage = () => {
  const blobs = [
    {
      id: 2,
      blob: redBlob2,
      opacity: 1,
      transform: 'scale(0.65)',
      translate: '-5rem, -5rem'
    },
    {
      id: 3,
      blob: yellowBlob3,
      opacity: 1,
      transform: 'scale(0.7)',
      translate: '65rem, -5rem'
    }
  ];

  return (
    <>
      <BlobBox blobs={blobs} />
      <PageContainer>
        <Row>
          <Col>
            <Title>{event.title}</Title>
            <Tagline>{event.tagline}</Tagline>
            <div style={{ textAlign: 'center', paddingTop: 75 }}>
              <Image
                src={Poster}
                alt="A night at the CAG-baret"
                height={1114}
              />
              <div id="tickets" style={{ paddingTop: 50 }}>
                <iframe
                  height={1000}
                  allowTransparency
                  allow="payment"
                  frameBorder="0"
                  style={{ width: 788, border: 'none' }}
                  src="https://secure.lglforms.com/form_engine/s/Ggqb-vmkrb6sWyeyD-TL9Q"
                >
                  <a href="https://secure.lglforms.com/form_engine/s/Ggqb-vmkrb6sWyeyD-TL9Q">
                    Fill out my LGL Form!
                  </a>
                </iframe>
              </div>
            </div>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

export default EventPage;
