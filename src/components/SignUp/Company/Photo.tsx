import React from 'react';
import { Container, Row } from 'react-bootstrap';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { ImageUploadComponent } from '../../../components/shared';
import { breakpoints } from '../../../theme/styleVars';
import SignUpBody from '../shared/Body';
import SignUpHeader from '../shared/Header';
import { CompanyData } from './types';

const CompanyPhoto: React.FC<{
  setForm: SetForm;
  formValues: CompanyData;
  setStepErrors: (step: string, hasErrors: boolean) => void;
}> = ({ setForm, formValues }) => {
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
        <SignUpHeader
          title="Add a theatre photo"
          subtitle="Your logo? A group photo?"
        />
      </Row>
      <Row>
        <SignUpBody lg="8">
          <ImageUploadContainer>
            <ImageUploadComponent
              onSave={handleImageSave}
              currentImageUrl={formValues.profilePhotoUrl}
              imageType="company"
              showCrop={true}
              maxSizeInMB={5}
            />
          </ImageUploadContainer>
        </SignUpBody>
      </Row>
    </Container>
  );
};

const ImageUploadContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: ${breakpoints.md}) {
    padding: 15px;
    max-width: 100%;
  }
`;

export default CompanyPhoto;
