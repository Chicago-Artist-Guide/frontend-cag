import { uuidv4 } from '@firebase/util';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useState, useCallback, useRef } from 'react';
import { Col } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import { Container } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import { useFirebaseContext } from '../../context/FirebaseContext';
import ResponsiveImageUpload from './ResponsiveImageUpload';
import ResponsiveImageCrop, { CropResult } from './ResponsiveImageCrop';
import { createCroppedImage, getAspectRatio } from '../../utils/cropImage';
import Button from './Button';
import { colors } from '../../theme/styleVars';

type ImageUploadType = 'User' | 'Poster';

interface ImageUploadModalProps {
  onSave: (imageUrl: string) => void;
  currentImgUrl: string | undefined;
  modal: boolean;
  type: ImageUploadType;
}

const ImageUpload: React.FC<ImageUploadModalProps> = ({
  onSave,
  currentImgUrl: imgUrl = '',
  modal,
  type
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [cropResult, setCropResult] = useState<CropResult | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const { firebaseStorage } = useFirebaseContext();
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const imageId = uuidv4();
  const aspectRatio = getAspectRatio(type === 'User' ? 'user' : 'poster');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    setShowCrop(true);
  }, []);

  const handleCropComplete = useCallback((result: CropResult) => {
    setCropResult(result);
  }, []);

  const handleCropSave = useCallback(async () => {
    if (!selectedFile || !imagePreviewUrl || !cropResult) {
      return;
    }

    try {
      setUploadInProgress(true);
      setUploadProgress(0);

      // Create cropped image blob
      const croppedBlob = await createCroppedImage(
        imagePreviewUrl,
        cropResult.croppedAreaPixels,
        cropResult.rotation
      );

      // Upload to Firebase
      const storageRef = ref(
        firebaseStorage,
        `/${imageId}-${selectedFile.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, croppedBlob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const currentPercent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(currentPercent);
        },
        (err) => {
          console.log('Error uploading image', err);
          setUploadInProgress(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            console.log('Uploaded image url:', url);
            setUploadInProgress(false);
            // Reset crop state after successful upload
            setShowCrop(false);
            setSelectedFile(null);
            setImagePreviewUrl(null);
            setCropResult(null);
            onSave(url);
          });
        }
      );
    } catch (err) {
      console.error('Error processing image:', err);
      setUploadInProgress(false);
    }
  }, [
    selectedFile,
    imagePreviewUrl,
    cropResult,
    firebaseStorage,
    imageId,
    onSave
  ]);

  const handleCropCancel = useCallback(() => {
    setShowCrop(false);
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setCropResult(null);
  }, []);

  // Mobile buttons for modal mode
  const MobileButtons = () => {
    return (
      <StyledRow>
        <Col>
          {cropResult && (
            <>
              <Button
                disabled={uploadInProgress}
                onClick={handleCropSave}
                text="Upload"
                type="button"
                variant="success"
              />
              {uploadInProgress ? (
                <ButtonLabel>Upload progress: {uploadProgress}%</ButtonLabel>
              ) : (
                <ButtonLabel>{selectedFile?.name}</ButtonLabel>
              )}
            </>
          )}
        </Col>
      </StyledRow>
    );
  };

  // Desktop buttons for non-modal mode
  const DesktopButtons = () => {
    return (
      <Col>
        {cropResult && (
          <>
            <Button
              disabled={uploadInProgress}
              onClick={handleCropSave}
              text="Upload"
              type="button"
              variant="success"
            />
            {uploadInProgress ? (
              <ButtonLabel>Upload progress: {uploadProgress}%</ButtonLabel>
            ) : (
              <ButtonLabel>{selectedFile?.name}</ButtonLabel>
            )}
          </>
        )}
      </Col>
    );
  };

  return (
    <Container>
      {modal && <MobileButtons />}
      <Row>
        {showCrop && imagePreviewUrl ? (
          <CropContainer>
            <ResponsiveImageCrop
              imageSrc={imagePreviewUrl}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
              onSave={handleCropSave}
              aspect={aspectRatio}
              cropShape={type === 'User' ? 'round' : 'rect'}
              disabled={uploadInProgress}
            />
          </CropContainer>
        ) : (
          <>
            <PhotoContainer
              style={{ backgroundImage: imgUrl ? `url(${imgUrl})` : undefined }}
            >
              {!imgUrl && !showCrop && (
                <div ref={dropzoneRef}>
                  <ResponsiveImageUpload
                    onFileSelect={handleFileSelect}
                    currentImageUrl={imgUrl}
                    showUploadButton={true}
                    disabled={uploadInProgress}
                    helperText="Max file size: 500mb. Recommended: .png, .jpg"
                  />
                </div>
              )}
            </PhotoContainer>
            {!modal && <DesktopButtons />}
            {!modal && !showCrop && (
              <UploadButtonContainer>
                <Button
                  onClick={() => {
                    // If there's an existing image, we need to trigger file selection differently
                    if (imgUrl) {
                      // Create a temporary file input to trigger file selection
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.accept = 'image/*';
                      fileInput.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleFileSelect(file);
                        }
                      };
                      fileInput.click();
                    } else if (dropzoneRef.current) {
                      // Find the dropzone container and click it
                      const dropzoneContainer =
                        dropzoneRef.current.querySelector('div') as HTMLElement;
                      if (dropzoneContainer) {
                        dropzoneContainer.click();
                      }
                    }
                  }}
                  text={imgUrl ? 'CHANGE IMAGE' : 'UPLOAD FILE'}
                  type="button"
                  variant="secondary"
                />
              </UploadButtonContainer>
            )}
          </>
        )}
      </Row>
    </Container>
  );
};

const PhotoContainer = styled.div`
  background: ${colors.lightGrey};
  color: white;
  font-size: 68px;
  background-repeat: no-repeat;
  background-size: cover;
  height: 100%;
  width: 100%;
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const CropContainer = styled.div`
  margin-bottom: 20px;
  text-align: center;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const StyledRow = styled(Row)`
  margin-top: 20px;
  margin-bottom: 25px;
`;

const ButtonLabel = styled.p`
  padding-top: 10px;
  font-size: 12px;
  color: ${colors.gray};
`;

const UploadButtonContainer = styled.div`
  margin-top: 15px;
  text-align: center;
`;

export default ImageUpload;
