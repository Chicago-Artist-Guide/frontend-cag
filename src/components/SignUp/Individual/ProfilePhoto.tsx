import React from 'react';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tagline, Title } from '../../layout/Titles';
import Button from '../../../genericComponents/Button';
import { colors } from '../../../theme/styleVars';
import yellow_blob from '../../../images/yellow_blob_2.svg';

const ProfilePhoto: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>LET'S PUT A FACE TO THE NAME</Title>
          <Tagline>
            We just need one for now, but you can add more later.
          </Tagline>
          <PhotoUploadRow>
            <Col lg="4">
              <PhotoContainer>
                <FontAwesomeIcon
                  className="bod-icon"
                  icon={faCamera}
                  size="lg"
                />
              </PhotoContainer>
            </Col>
            <ButtonCol lg="4">
              <Button
                onClick={() => null}
                text="Choose File"
                type="button"
                variant="secondary"
              />
              <p>File size limit: 5MB</p>
            </ButtonCol>
            <ImageCol lg="4">
              <Image alt="" src={yellow_blob} />
            </ImageCol>
          </PhotoUploadRow>
        </Col>
      </Row>
    </Container>
  );
};

const PhotoUploadRow = styled(Row)`
  margin-top: 40px;
`;

const PhotoContainer = styled.div`
  align-items: center;
  background: ${colors.lightGrey};
  color: white;
  display: flex;
  font-size: 68px;
  height: 300px;
  justify-content: center;
  width: 100%;
`;

const ButtonCol = styled(Col)`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-top: 40px;

  p {
    font-style: italic;
    padding-top: 12px;
  }
`;

const ImageCol = styled(Col)`
  display: flex;
  max-height: 100%;
  max-width: 100%;
`;

export default ProfilePhoto;
