import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { ImageUploadComponent } from '../../../components/shared';
import yellow_blob from '../../../images/yellow_blob_2.svg';
import { Tagline, Title } from '../../layout/Titles';
import type { IndividualData } from './types';

const ProfilePhoto: React.FC<{
  setForm: SetForm;
  formData: IndividualData;
}> = ({ setForm, formData }) => {
  const handleImageSave = (imageUrl: string) => {
    setForm({
      target: {
        name: 'profilePhotoUrl',
        value: imageUrl
      }
    });
  };

  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>LET'S PUT A FACE TO THE NAME</Title>
          <Tagline>
            We just need one for now, but you can add more later.
          </Tagline>
          <PhotoUploadRow>
            <Col lg="6">
              <ImageUploadComponent
                onSave={handleImageSave}
                currentImageUrl={formData.profilePhotoUrl}
                imageType="user"
                showCrop={true}
                maxSizeInMB={5}
              />
            </Col>
            <ImageCol lg="6">
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
  align-items: center;
`;

const ImageCol = styled(Col)`
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-width: 100%;
    height: auto;
  }
`;

export default ProfilePhoto;
