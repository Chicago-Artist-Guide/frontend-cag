import React, { useState, useCallback, useRef, useEffect } from 'react';
import { uuidv4 } from '@firebase/util';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { createCroppedImage, getAspectRatio } from '../../utils/cropImage';
import Button from './Button';
import { colors, fonts, breakpoints } from '../../theme/styleVars';

export type ImageType = 'user' | 'poster' | 'production' | 'company';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropResult {
  croppedAreaPixels: CropArea;
  croppedAreaPercentages: CropArea;
  rotation: number;
}

interface UnifiedImageUploadProps {
  onSave: (imageUrl: string, file?: File) => void;
  currentImageUrl?: string;
  imageType: ImageType;
  disabled?: boolean;
  showCrop?: boolean;
  maxSizeInMB?: number;
  helperText?: string;
}

type UploadStep = 'select' | 'crop' | 'upload' | 'complete';

// Utility function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const UnifiedImageUpload: React.FC<UnifiedImageUploadProps> = ({
  onSave,
  currentImageUrl,
  imageType,
  disabled = false,
  showCrop = true,
  maxSizeInMB = 5,
  helperText = 'Max file size: 5MB. Recommended: .png, .jpg'
}) => {
  const [currentStep, setCurrentStep] = useState<UploadStep>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropResult, setCropResult] = useState<CropResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const { firebaseStorage } = useFirebaseContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatio = getAspectRatio(imageType);
  const cropShape = imageType === 'user' ? 'round' : 'rect';

  // Handle existing image URL - only set to complete if we have an image and no active upload process
  useEffect(() => {
    if (
      currentImageUrl &&
      !selectedFile &&
      !isUploading &&
      currentStep !== 'select'
    ) {
      setCurrentStep('complete');
    } else if (!currentImageUrl && !selectedFile && !isUploading) {
      setCurrentStep('select');
    }
  }, [currentImageUrl, selectedFile, isUploading, currentStep]);

  // Reset component state when changing image
  const handleChangeImage = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCropResult(null);
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCurrentStep('select');
  }, []);

  // File validation and selection
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
          setError(`File is too large. Maximum size is ${maxSizeInMB}MB`);
        } else if (
          rejection.errors.some((e: any) => e.code === 'file-invalid-type')
        ) {
          setError('Invalid file type. Please select an image file.');
        } else {
          setError('File upload failed. Please try again.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        if (showCrop) {
          setCurrentStep('crop');
        } else {
          setCurrentStep('upload');
        }
      }
    },
    [maxSizeInMB, showCrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: maxSizeInMB * 1024 * 1024,
    multiple: false,
    disabled: disabled || isUploading
  });

  // Crop handling
  const onCropComplete = useCallback(
    (croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      setCropResult({
        croppedAreaPixels,
        croppedAreaPercentages: croppedArea,
        rotation
      });
    },
    [rotation]
  );

  const handleCropSave = useCallback(() => {
    if (cropResult) {
      setCurrentStep('upload');
    }
  }, [cropResult]);

  const handleCropCancel = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCropResult(null);
    setCurrentStep('select');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }, []);

  // Upload handling
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      let fileToUpload: Blob = selectedFile;

      // Create cropped image if crop was used
      if (showCrop && cropResult && previewUrl) {
        fileToUpload = await createCroppedImage(
          previewUrl,
          cropResult.croppedAreaPixels,
          cropResult.rotation
        );
      }

      // Upload to Firebase
      const imageId = uuidv4();
      const storageRef = ref(
        firebaseStorage,
        `/${imageId}-${selectedFile.name}`
      );

      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Upload failed. Please try again.');
          setIsUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setIsUploading(false);
            onSave(url, selectedFile);

            // Reset upload state but let currentImageUrl prop control the step
            setSelectedFile(null);
            setPreviewUrl(null);
            setCropResult(null);
            setUploadProgress(0);
            setError(null);
          });
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  }, [selectedFile, showCrop, cropResult, previewUrl, firebaseStorage, onSave]);

  const handleSelectNew = useCallback(() => {
    handleCropCancel();
  }, [handleCropCancel]);

  return (
    <Container>
      {currentStep === 'select' && (
        <SelectStep>
          <DropzoneContainer
            {...getRootProps()}
            isDragActive={isDragActive}
            disabled={disabled}
            hasImage={!!currentImageUrl}
          >
            <input {...getInputProps()} ref={fileInputRef} />

            <DropzoneContent>
              <UploadIcon>📁</UploadIcon>
              <DropzoneText>
                {isDragActive ? (
                  'Drop the image here...'
                ) : (
                  <>
                    <strong>Drag & drop an image here</strong>
                    <br />
                    or click to select
                  </>
                )}
              </DropzoneText>
            </DropzoneContent>
          </DropzoneContainer>

          <HelperText>{helperText}</HelperText>
          {error && <ErrorText>{error}</ErrorText>}
        </SelectStep>
      )}

      {currentStep === 'crop' && previewUrl && (
        <CropStep>
          <CropperContainer>
            <Cropper
              image={previewUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              cropShape={cropShape}
              showGrid={true}
              minZoom={1}
              maxZoom={3}
              style={{
                containerStyle: {
                  backgroundColor: colors.black,
                  borderRadius: '8px'
                },
                mediaStyle: { borderRadius: '8px' }
              }}
            />
          </CropperContainer>

          <CropControls>
            <ZoomControls>
              <ZoomLabel>Zoom</ZoomLabel>
              <ZoomSlider
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
              <ZoomValue>{Math.round(zoom * 100)}%</ZoomValue>
            </ZoomControls>

            <RotationControls>
              <ControlButton
                onClick={() => setRotation((prev) => prev - 90)}
                text="⟲"
                variant="secondary"
                title="Rotate left"
              />
              <ControlButton
                onClick={() => setRotation((prev) => prev + 90)}
                text="⟳"
                variant="secondary"
                title="Rotate right"
              />
              <ControlButton
                onClick={() => {
                  setCrop({ x: 0, y: 0 });
                  setZoom(1);
                  setRotation(0);
                }}
                text="RESET"
                variant="secondary"
              />
            </RotationControls>
          </CropControls>

          <CropActions>
            <Button
              onClick={handleCropCancel}
              text="Cancel"
              variant="secondary"
            />
            <Button
              onClick={handleCropSave}
              text="Continue"
              variant="primary"
              disabled={!cropResult}
            />
          </CropActions>
        </CropStep>
      )}

      {currentStep === 'upload' && (
        <UploadStep>
          {selectedFile && (
            <SelectedFileInfo>
              <FilePreview>
                {previewUrl && (
                  <PreviewImage src={previewUrl} alt="Selected file" />
                )}
              </FilePreview>
              <FileDetails>
                <FileName>{selectedFile.name}</FileName>
                <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
              </FileDetails>
            </SelectedFileInfo>
          )}

          <UploadActions>
            <Button
              onClick={handleSelectNew}
              text="SELECT DIFFERENT IMAGE"
              variant="secondary"
              disabled={isUploading}
            />
            <Button
              onClick={handleUpload}
              text={
                isUploading ? `Uploading... ${uploadProgress}%` : 'UPLOAD FILE'
              }
              variant="primary"
              disabled={isUploading || !selectedFile}
            />
          </UploadActions>

          {isUploading && (
            <ProgressContainer>
              <ProgressBar progress={uploadProgress} />
              <ProgressText>{uploadProgress}% uploaded</ProgressText>
            </ProgressContainer>
          )}

          {error && <ErrorText>{error}</ErrorText>}
        </UploadStep>
      )}

      {currentStep === 'complete' && (
        <CompleteStep>
          {currentImageUrl ? (
            <>
              <ExistingImageContainer>
                <ExistingImage src={currentImageUrl} alt="Current image" />
              </ExistingImageContainer>
              <Button
                onClick={handleChangeImage}
                text="CHANGE IMAGE"
                variant="primary"
                disabled={disabled}
              />
              <HelperText>{helperText}</HelperText>
            </>
          ) : (
            <SuccessMessage>✅ Image uploaded successfully!</SuccessMessage>
          )}
        </CompleteStep>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const SelectStep = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DropzoneContainer = styled.div<{
  isDragActive: boolean;
  disabled: boolean;
  hasImage: boolean;
}>`
  border: 2px dashed
    ${({ isDragActive, hasImage }) =>
      isDragActive
        ? colors.primary
        : hasImage
          ? 'transparent'
          : colors.lightGrey};
  border-radius: 8px;
  padding: ${({ hasImage }) => (hasImage ? '0' : '40px 20px')};
  text-align: center;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: border-color 0.2s ease;
  background: ${({ hasImage }) => (hasImage ? 'transparent' : colors.white)};
  min-height: ${({ hasImage }) => (hasImage ? 'auto' : '200px')};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${({ disabled, hasImage }) =>
      disabled ? colors.lightGrey : hasImage ? 'transparent' : colors.primary};
  }

  @media (max-width: ${breakpoints.md}) {
    min-height: ${({ hasImage }) => (hasImage ? 'auto' : '150px')};
    padding: ${({ hasImage }) => (hasImage ? '0' : '20px 10px')};
  }
`;

const DropzoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const UploadIcon = styled.div`
  font-size: 48px;

  @media (max-width: ${breakpoints.md}) {
    font-size: 36px;
  }
`;

const DropzoneText = styled.div`
  font-family: ${fonts.lora};
  font-size: 16px;
  color: ${colors.darkGrey};
  line-height: 1.4;

  @media (max-width: ${breakpoints.md}) {
    font-size: 14px;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;

  @media (max-width: ${breakpoints.md}) {
    max-height: 200px;
  }
`;

const ChangeImageButton = styled(Button)`
  margin-top: 12px;
`;

const HelperText = styled.div`
  font-family: ${fonts.lora};
  font-size: 12px;
  font-style: italic;
  color: ${colors.darkGrey};
  text-align: center;
`;

const ErrorText = styled.div`
  font-family: ${fonts.lora};
  font-size: 12px;
  color: ${colors.salmon};
  text-align: center;
  margin-top: 8px;
`;

const CropStep = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CropperContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background: ${colors.black};
  border-radius: 8px;

  @media (max-width: ${breakpoints.md}) {
    height: 300px;
  }
`;

const CropControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ZoomLabel = styled.span`
  font-family: ${fonts.lora};
  font-size: 14px;
  color: ${colors.darkGrey};
  min-width: 40px;
`;

const ZoomSlider = styled.input`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: ${colors.lightGrey};
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
    border: none;
  }
`;

const ZoomValue = styled.span`
  font-family: ${fonts.lora};
  font-size: 14px;
  color: ${colors.darkGrey};
  min-width: 40px;
  text-align: right;
`;

const RotationControls = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const ControlButton = styled(Button)`
  min-width: 50px;
`;

const CropActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: space-between;
`;

const UploadStep = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SelectedFileInfo = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: ${colors.lightGrey};
  border-radius: 8px;
`;

const FilePreview = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const FileDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-family: ${fonts.lora};
  font-size: 14px;
  font-weight: 600;
  color: ${colors.darkGrey};
  margin-bottom: 4px;
  word-break: break-word;
`;

const FileSize = styled.div`
  font-family: ${fonts.lora};
  font-size: 12px;
  color: ${colors.grayishBlue};
`;

const UploadActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: space-between;

  @media (max-width: ${breakpoints.sm}) {
    flex-direction: column;
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 8px;
  background: ${colors.lightGrey};
  border-radius: 4px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${({ progress }) => progress}%;
    height: 100%;
    background: ${colors.primary};
    transition: width 0.3s ease;
  }
`;

const ProgressText = styled.div`
  font-family: ${fonts.lora};
  font-size: 12px;
  color: ${colors.darkGrey};
  text-align: center;
`;

const CompleteStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
`;

const ExistingImageContainer = styled.div`
  width: 300px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid ${colors.lightGrey};
`;

const ExistingImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SuccessMessage = styled.div`
  font-family: ${fonts.lora};
  font-size: 16px;
  color: ${colors.mint};
  text-align: center;
`;

export default UnifiedImageUpload;
