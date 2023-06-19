import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button as BSButton, Col, Fade, Modal, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { colors, fonts } from '../../theme/styleVars';

const BANNER_KEY = 'cag-hide-banner';
const MODAL_KEY = 'cag-hide-modal';

const EventAlert = () => {
  const [hideBanner, setHideBanner] = useState<boolean>(true);
  const [hideModal, setHideModal] = useState<boolean>(true);

  useEffect(() => {
    const hasBannerKey = localStorage.getItem(BANNER_KEY);
    const hasModalKey = localStorage.getItem(MODAL_KEY);
    if (!hasBannerKey) {
      setHideBanner(false);
    }
    if (!hasModalKey) {
      setHideModal(false);
    }
  }, []);

  const onCloseBanner = () => {
    setHideBanner(true);
    localStorage.setItem(BANNER_KEY, 'true');
  };

  const onCloseModal = () => {
    setHideModal(true);
    localStorage.setItem(MODAL_KEY, 'true');
  };

  return (
    <>
      <Fade in={!hideBanner}>
        <Banner>
          <BannerLink href="/night-at-the-cag-baret">
            Join us for a Night at the CAG-Baret - Click here for info!
          </BannerLink>
          <CloseIcon icon={faClose} size="lg" onClick={onCloseBanner} />
        </Banner>
      </Fade>
      <Modal
        show={!hideModal}
        onHide={onCloseModal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <Row>
            <Col>
              <CloseIcon
                icon={faClose}
                size="lg"
                onClick={onCloseModal}
                style={{ color: colors.grayishBlue }}
              />
            </Col>
          </Row>
          <Row>
            <Col style={{ padding: 50 }}>
              <Divider />
              <ModalTitle>Come celebrate with us!</ModalTitle>
              <ModalDetail style={{ fontWeight: 400 }}>
                Join us for{' '}
                <span style={{ fontWeight: 900, color: colors.black }}>
                  A Night At The CAG-baret
                </span>{' '}
                as we celebrate the upcoming release of our platform! We'll have
                drinks, music and a silent auction - so come and enjoy a night
                with us, and help support our efforts at making Chicago theatre
                more diverse, equitable and inclusive.
              </ModalDetail>
              <ModalDetail
                style={{ fontWeight: 900, color: colors.black, marginTop: 30 }}
              >
                Special friends & family pricing available now!
              </ModalDetail>
              <div style={{ textAlign: 'center' }}>
                <Button
                  href="/night-at-the-cag-baret#tickets"
                  onClick={onCloseModal}
                >
                  Buy Tickets
                </Button>
              </div>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EventAlert;

const Banner = styled.div`
  padding: 15px 0;
  text-align: center;
  color: ${colors.white};
  text-transform: uppercase;
  letter-spacing: 0.07em;
  line-height: 26px;
  font-size: 18px;
  font-weight: 700;
  font-family: ${fonts.montserrat};
  background-color: ${colors.butter};
  margin-top: calc(3% + 60px);
  z-index: 99;
  position: sticky;
`;

const BannerLink = styled.a`
  text-decoration: none;
  color: ${colors.white};
`;

const CloseIcon = styled(FontAwesomeIcon)`
  color: ${colors.white};
  float: right;
  margin-right: 20px;
  margin-left: -20px;
  cursor: pointer;
  &:hover {
    color: ${colors.slate};
  }
`;

const Divider = styled.div`
  width: 250px;
  height: 8px;
  border-radius: 4px;
  margin: 12px 0;
  background-image: linear-gradient(90deg, #efc93d 0%, #e17b60 100%);
`;

const ModalTitle = styled.h1`
  font-family: ${fonts.montserrat};
  font-weight: 700;
  font-size: 28px;
  color: ${colors.black};
  text-transform: uppercase;
  letter-spacing: 0.07em;
  line-height: 38px;
`;

const ModalDetail = styled.div`
  padding-top: 15px;
  font-family: ${fonts.lora};
  font-style: italic;
  font-size: 22px;
  line-height: 28px;
  color: ${colors.slate};
  letter-spacing: 0.01em;
`;

const Button = styled(BSButton)`
  margin: 55px auto 0;
  border: none;
  border-radius: 43px;
  box-shadow: 0px 0px 8px 4px #0000000d;
  font-family: ${fonts.montserrat};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 12px 35px;
  text-align: center;
  text-transform: uppercase;
  background: ${colors.salmon};
`;
