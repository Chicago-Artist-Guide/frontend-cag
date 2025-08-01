import React, { useState, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import ResponsiveImageUpload from './ResponsiveImageUpload';
import ResponsiveImageCrop, { CropResult } from './ResponsiveImageCrop';
import {
  createCroppedImage,
  blobToFile,
  getAspectRatio
} from '../../utils/cropImage';
import { colors, fonts, breakpoints } from '../../theme/styleVars';
import Button from './Button';

type ImageType = 'user' | 'poster' | 'production' | 'company';

interface ResponsiveImageUploadModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (imageUrl: string, file?: File) => void;
  currentImageUrl?: string;
  imageType?: ImageType;
  title?: string;
  maxSizeInMB?: number;
  disabled?: boolean;
}

type ModalStep = 'upload' | 'crop' | 'uploading';

const ResponsiveImageUploadModal: React.FC<ResponsiveImageUploadModalProps> = ({
  show,
  onHide,
  onSave,
  currentImageUrl,
  imageType = 'user',
  title = 'Upload Image',
  maxSizeInMB = 5,
  disabled = false
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [cropResult, setCropResult] = useState<CropResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const aspectRatio = getAspectRatio(imageType);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);

    // Create preview URL for cropping
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    setCurrentStep('crop');
  }, []);

  const handleCropComplete = useCallback((result: CropResult) => {
    setCropResult(result);
  }, []);

  const handleCropSave = useCallback(async () => {
    if (!selectedFile || !imagePreviewUrl || !cropResult) {
      setError('Missing required data for cropping');
      return;
    }

    try {
      setCurrentStep('uploading');
      setUploadProgress(0);

      // Create cropped image blob
      const croppedBlob = await createCroppedImage(
        imagePreviewUrl,
        cropResult.croppedAreaPixels,
        cropResult.rotation
      );

      // Convert to file
      const croppedFile = blobToFile(croppedBlob, selectedFile.name);

      // Create URL for the cropped image
      const croppedUrl = URL.createObjectURL(croppedBlob);

      // Simulate upload progress (replace with actual upload logic)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            onSave(croppedUrl, croppedFile);
            handleClose();
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    } catch (err) {
      console.error('Error cropping image:', err);
      setError('Failed to process image. Please try again.');
      setCurrentStep('crop');
    }
  }, [selectedFile, imagePreviewUrl, cropResult, onSave]);

  const handleCropCancel = useCallback(() => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setCropResult(null);
  }, []);

  const handleClose = useCallback(() => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setCropResult(null);
    setUploadProgress(0);
    setError(null);
    onHide();
  }, [onHide]);

  const renderContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <ResponsiveImageUpload
            onFileSelect={handleFileSelect}
            accept="image/*"
            maxSize={maxSizeInMB * 1024 * 1024}
            disabled={disabled}
            currentImageUrl={currentImageUrl}
            showUploadButton={false}
            helperText={`File size limit: ${maxSizeInMB}MB. Recommended: .png, .jpg`}
          />
        );

      case 'crop':
        return imagePreviewUrl ? (
          <ResponsiveImageCrop
            imageSrc={imagePreviewUrl}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            onSave={handleCropSave}
            aspect={aspectRatio}
            cropShape={imageType === 'user' ? 'round' : 'rect'}
          />
        ) : null;

      case 'uploading':
        return (
          <UploadingContainer>
            <UploadingIcon>⏳</UploadingIcon>
            <UploadingText>Processing your image...</UploadingText>
            <ProgressBar progress={uploadProgress} />
            <ProgressText>{uploadProgress}% complete</ProgressText>
          </UploadingContainer>
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case 'upload':
        return title;
      case 'crop':
        return 'Crop Your Image';
      case 'uploading':
        return 'Uploading...';
      default:
        return title;
    }
  };

  return (
    <StyledModal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      backdrop={currentStep === 'uploading' ? 'static' : true}
      keyboard={currentStep !== 'uploading'}
    >
      <Modal.Header closeButton={currentStep !== 'uploading'}>
        <Modal.Title>{getModalTitle()}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <ErrorAlert>{error}</ErrorAlert>}
        {renderContent()}
      </Modal.Body>

      {currentStep === 'upload' && (
        <Modal.Footer>
          <Button
            onClick={handleClose}
            text="Cancel"
            variant="secondary"
            disabled={disabled}
          />
        </Modal.Footer>
      )}
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  .modal-dialog {
    max-width: 600px;

    @media (max-width: ${breakpoints.md}) {
      max-width: 95%;
      margin: 10px auto;
    }
  }

  .modal-content {
    border-radius: 12px;
    border: none;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    border-bottom: 1px solid ${colors.lightestGrey};
    padding: 20px 24px 16px;

    .modal-title {
      font-family: ${fonts.montserrat};
      font-weight: 600;
      color: ${colors.dark};
      font-size: 18px;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      color: ${colors.gray};
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }
  }

  .modal-body {
    padding: 24px;
  }

  .modal-footer {
    border-top: 1px solid ${colors.lightestGrey};
    padding: 16px 24px 20px;
    justify-content: flex-end;
  }
`;

const ErrorAlert = styled.div`
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-family: ${fonts.mainFont};
  font-size: 14px;
`;

const UploadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
`;

const UploadingIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const UploadingText = styled.h4`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  color: ${colors.dark};
  margin-bottom: 24px;
  font-size: 18px;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  max-width: 300px;
  height: 8px;
  background-color: ${colors.lightGrey};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;

  &::after {
    content: '';
    display: block;
    width: ${(props) => props.progress}%;
    height: 100%;
    background-color: ${colors.primary};
    transition: width 0.3s ease;
  }
`;

const ProgressText = styled.span`
  font-family: ${fonts.mainFont};
  font-size: 14px;
  color: ${colors.gray};
  font-weight: 500;
`;

export default ResponsiveImageUploadModal;
