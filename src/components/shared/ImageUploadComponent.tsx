import React, { useState, useCallback, useRef, useEffect } from 'react';
import { uuidv4 } from '@firebase/util';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { useFirebaseContext } from '../../context/FirebaseContext';
import {
  createCroppedImage,
  getAspectRatio,
  validateImageFile
} from '../../utils/cropImage';
import Button from './Button';
import { colors, fonts, breakpoints } from '../../theme/styleVars';
import { ImageType } from '../../types/imageUpload';

interface ImageUploadComponentProps {
  onSave: (imageUrl: string, file?: File) => void;
  currentImageUrl?: string;
  imageType: ImageType;
  disabled?: boolean;
  showCrop?: boolean;
  maxSizeInMB?: number;
  helperText?: string;
  className?: string;
  onUploadStateChange?: (isUploading: boolean) => void;
}

type UploadState = 'idle' | 'selected' | 'cropping' | 'uploading' | 'complete';

const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  onSave,
  currentImageUrl,
  imageType,
  disabled = false,
  showCrop = true,
  maxSizeInMB = 5,
  helperText,
  className,
  onUploadStateChange
}) => {
  const [state, setState] = useState<UploadState>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userIsChanging, setUserIsChanging] = useState(false);

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const { firebaseStorage } = useFirebaseContext();

  const aspectRatio = getAspectRatio(imageType);
  const cropShape = imageType === 'user' ? 'round' : 'rect';

  // Set initial state based on current image (only when not actively changing)
  useEffect(() => {
    if (currentImageUrl && !userIsChanging) {
      setState('complete');
    }
  }, [currentImageUrl, userIsChanging]);

  // Helper text based on image type
  const getHelperText = () => {
    if (helperText) return helperText;

    const sizeText = `Max file size: ${maxSizeInMB}MB`;
    const formatText = 'Recommended: .png, .jpg, .webp';

    switch (imageType) {
      case 'user':
        return `Upload your profile picture. ${sizeText}. ${formatText}`;
      case 'company':
        return `Upload your company logo. ${sizeText}. ${formatText}`;
      case 'poster':
        return `Upload poster image. ${sizeText}. ${formatText}`;
      case 'production':
        return `Upload production image. ${sizeText}. ${formatText}`;
      default:
        return `${sizeText}. ${formatText}`;
    }
  };

  const resetComponent = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setUserIsChanging(true);
    setState('idle');
  }, []);

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

        // Additional validation
        const validation = validateImageFile(file, maxSizeInMB);
        if (!validation.isValid) {
          setError(validation.error || 'Invalid file');
          return;
        }

        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        if (showCrop) {
          setState('cropping');
        } else {
          setState('selected');
        }
      }
    },
    [maxSizeInMB, showCrop, state]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: maxSizeInMB * 1024 * 1024,
    multiple: false,
    disabled: disabled || state === 'uploading' || state !== 'idle'
  });

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropSave = useCallback(() => {
    setState('selected');
  }, []);

  const handleCropCancel = useCallback(() => {
    resetComponent();
  }, [resetComponent]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setState('uploading');
      setUploadProgress(0);
      setError(null);
      onUploadStateChange?.(true); // Notify that upload started

      let fileToUpload: Blob = selectedFile;

      // Create cropped image if needed
      if (showCrop && croppedAreaPixels && previewUrl) {
        fileToUpload = await createCroppedImage(
          previewUrl,
          croppedAreaPixels,
          rotation
        );
      }

      // Upload to Firebase
      const imageId = uuidv4();
      const storageRef = ref(
        firebaseStorage,
        `images/${imageType}/${imageId}-${selectedFile.name}`
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
          setError('Upload failed. Please try again.');
          setState('selected');
          onUploadStateChange?.(false); // Notify that upload failed
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            onSave(url, selectedFile);
            setState('complete');
            setUserIsChanging(false);
            onUploadStateChange?.(false); // Notify that upload completed

            // Clean up preview URL
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
            }
          });
        }
      );
    } catch (error) {
      setError('Upload failed. Please try again.');
      setState('selected');
      onUploadStateChange?.(false); // Notify that upload failed
    }
  }, [
    selectedFile,
    showCrop,
    croppedAreaPixels,
    previewUrl,
    rotation,
    firebaseStorage,
    imageType,
    onSave,
    onUploadStateChange
  ]);

  const renderIdleState = () => (
    <DropzoneContainer
      {...getRootProps()}
      isDragActive={isDragActive}
      disabled={disabled}
    >
      <input {...getInputProps()} />
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
  );

  const renderCroppingState = () => (
    <CropContainer>
      <CropperWrapper>
        <Cropper
          image={previewUrl!}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          cropShape={cropShape as any}
          showGrid={true}
          style={{
            containerStyle: { backgroundColor: colors.black },
            mediaStyle: { borderRadius: '8px' }
          }}
        />
      </CropperWrapper>

      <CropControls>
        <ZoomControl>
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
        </ZoomControl>

        <RotationControls>
          <Button
            onClick={() => setRotation((prev) => prev - 90)}
            text="⟲"
            variant="secondary"
            title="Rotate left"
          />
          <Button
            onClick={() => setRotation((prev) => prev + 90)}
            text="⟳"
            variant="secondary"
            title="Rotate right"
          />
          <Button
            onClick={() => {
              setCrop({ x: 0, y: 0 });
              setZoom(1);
              setRotation(0);
            }}
            text="Reset"
            variant="secondary"
          />
        </RotationControls>
      </CropControls>

      <CropActions>
        <Button onClick={handleCropCancel} text="Cancel" variant="secondary" />
        <Button
          onClick={handleCropSave}
          text="Apply Crop"
          variant="primary"
          disabled={!croppedAreaPixels}
        />
      </CropActions>
    </CropContainer>
  );

  const renderSelectedState = () => (
    <SelectedContainer>
      {previewUrl && (
        <PreviewImageContainer>
          <PreviewImage src={previewUrl} alt="Selected image" />
        </PreviewImageContainer>
      )}

      {selectedFile && (
        <FileInfo>
          <FileName>{selectedFile.name}</FileName>
          <FileSize>
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </FileSize>
        </FileInfo>
      )}

      <ActionButtons>
        <Button
          onClick={resetComponent}
          text="Select Different Image"
          variant="secondary"
          disabled={state === 'uploading'}
        />
        <Button
          onClick={handleUpload}
          text="Upload File"
          variant="primary"
          disabled={state === 'uploading'}
        />
      </ActionButtons>
    </SelectedContainer>
  );

  const renderUploadingState = () => (
    <UploadingContainer>
      <ProgressContainer>
        <ProgressBar progress={uploadProgress} />
        <ProgressText>Uploading... {uploadProgress}%</ProgressText>
      </ProgressContainer>
    </UploadingContainer>
  );

  const renderCompleteState = () => (
    <CompleteContainer>
      {currentImageUrl && (
        <CurrentImageContainer>
          <CurrentImage src={currentImageUrl} alt="Current image" />
          <Button
            onClick={resetComponent}
            text="Change Image"
            variant="primary"
            disabled={disabled}
          />
        </CurrentImageContainer>
      )}
    </CompleteContainer>
  );

  return (
    <Container className={className}>
      {state === 'idle' && renderIdleState()}
      {state === 'cropping' && renderCroppingState()}
      {state === 'selected' && renderSelectedState()}
      {state === 'uploading' && renderUploadingState()}
      {state === 'complete' && renderCompleteState()}

      <HelperText>{getHelperText()}</HelperText>
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const DropzoneContainer = styled.div<{
  isDragActive: boolean;
  disabled: boolean;
}>`
  border: 2px dashed
    ${({ isDragActive }) => (isDragActive ? colors.primary : colors.lightGrey)};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  background: ${({ isDragActive }) =>
    isDragActive ? colors.yoda : colors.white};
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${({ disabled }) =>
      disabled ? colors.lightGrey : colors.primary};
    background: ${({ disabled }) => (disabled ? colors.white : colors.yoda)};
  }

  @media (max-width: ${breakpoints.md}) {
    min-height: 150px;
    padding: 20px 10px;
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
  opacity: 0.6;

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

const CropContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CropperWrapper = styled.div`
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

const ZoomControl = styled.div`
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

const CropActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: space-between;
`;

const SelectedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PreviewImageContainer = styled.div`
  width: 100%;
  max-height: 300px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid ${colors.lightGrey};
`;

const PreviewImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
`;

const FileInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: ${colors.lightGrey};
  border-radius: 8px;
`;

const FileName = styled.span`
  font-family: ${fonts.lora};
  font-size: 14px;
  font-weight: 600;
  color: ${colors.darkGrey};
  flex: 1;
  margin-right: 12px;
  word-break: break-word;
`;

const FileSize = styled.span`
  font-family: ${fonts.lora};
  font-size: 12px;
  color: ${colors.grayishBlue};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: ${breakpoints.sm}) {
    flex-direction: column;
  }
`;

const UploadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
`;

const ProgressContainer = styled.div`
  width: 100%;
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
  font-size: 14px;
  color: ${colors.darkGrey};
  text-align: center;
`;

const CompleteContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const CurrentImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const CurrentImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid ${colors.lightGrey};
`;

const HelperText = styled.div`
  font-family: ${fonts.lora};
  font-size: 12px;
  font-style: italic;
  color: ${colors.darkGrey};
  text-align: center;
  margin-top: 12px;
`;

const ErrorText = styled.div`
  font-family: ${fonts.lora};
  font-size: 12px;
  color: ${colors.salmon};
  text-align: center;
  margin-top: 8px;
`;

export default ImageUploadComponent;
