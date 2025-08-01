import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { colors, fonts, breakpoints } from '../../theme/styleVars';
import Button from './Button';

interface ResponsiveImageUploadProps {
  onFileSelect: (file: File) => void;
  onUpload?: (file: File) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  currentImageUrl?: string;
  showUploadButton?: boolean;
  uploadProgress?: number;
  isUploading?: boolean;
  helperText?: string;
}

const ResponsiveImageUpload: React.FC<ResponsiveImageUploadProps> = ({
  onFileSelect,
  onUpload,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  disabled = false,
  currentImageUrl,
  showUploadButton = true,
  uploadProgress = 0,
  isUploading = false,
  helperText = 'File size limit: 5MB'
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
          setError(
            `File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB`
          );
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

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize,
    multiple: false,
    disabled
  });

  const handleUpload = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile);
    }
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <Container>
      <DropzoneContainer
        {...getRootProps()}
        isDragActive={isDragActive}
        disabled={disabled}
        hasImage={!!displayImageUrl}
      >
        <input {...getInputProps()} ref={fileInputRef} />

        {displayImageUrl ? (
          <PreviewImage src={displayImageUrl} alt="Preview" />
        ) : (
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
        )}

        {isUploading && (
          <ProgressOverlay>
            <ProgressBar progress={uploadProgress} />
            <ProgressText>{uploadProgress}% uploaded</ProgressText>
          </ProgressOverlay>
        )}
      </DropzoneContainer>

      <Controls>
        {error && <ErrorText>{error}</ErrorText>}

        {helperText && !error && <HelperText>{helperText}</HelperText>}

        {selectedFile && (
          <FileInfo>
            <FileName>{selectedFile.name}</FileName>
            <FileSize>{Math.round(selectedFile.size / 1024)} KB</FileSize>
          </FileInfo>
        )}

        {showUploadButton && selectedFile && onUpload && (
          <UploadButton
            onClick={handleUpload}
            disabled={isUploading}
            text={isUploading ? 'Uploading...' : 'Upload'}
            variant="success"
          />
        )}
      </Controls>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 400px;
`;

const DropzoneContainer = styled.div<{
  isDragActive: boolean;
  disabled: boolean;
  hasImage: boolean;
}>`
  position: relative;
  border: 2px dashed
    ${(props) =>
      props.isDragActive
        ? colors.primary
        : props.hasImage
          ? 'transparent'
          : colors.lightGrey};
  border-radius: 8px;
  padding: ${(props) => (props.hasImage ? '0' : '20px')};
  text-align: center;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;
  background-color: ${(props) =>
    props.isDragActive
      ? colors.yoda
      : props.disabled
        ? colors.lightestGrey
        : colors.white};
  min-height: ${(props) => (props.hasImage ? '200px' : '150px')};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &:hover {
    border-color: ${(props) =>
      !props.disabled && !props.hasImage ? colors.primary : undefined};
    background-color: ${(props) =>
      !props.disabled && !props.hasImage ? colors.yoda : undefined};
  }

  @media (max-width: ${breakpoints.md}) {
    min-height: ${(props) => (props.hasImage ? '180px' : '120px')};
    padding: ${(props) => (props.hasImage ? '0' : '15px')};
  }
`;

const DropzoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const UploadIcon = styled.div`
  font-size: 48px;
  opacity: 0.6;

  @media (max-width: ${breakpoints.md}) {
    font-size: 36px;
  }
`;

const DropzoneText = styled.p`
  margin: 0;
  font-family: ${fonts.mainFont};
  color: ${colors.gray};
  font-size: 14px;
  line-height: 1.4;

  @media (max-width: ${breakpoints.md}) {
    font-size: 12px;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
`;

const ProgressOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 80%;
  height: 8px;
  background-color: ${colors.lightGrey};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;

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
  color: ${colors.white};
  font-family: ${fonts.mainFont};
  font-size: 14px;
  font-weight: 600;
`;

const Controls = styled.div`
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${colors.salmon};
  font-family: ${fonts.mainFont};
  font-size: 12px;
  font-weight: 500;
`;

const HelperText = styled.p`
  margin: 0;
  color: ${colors.gray};
  font-family: ${fonts.lora};
  font-size: 12px;
  font-style: italic;
  font-weight: 500;
`;

const FileInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: ${colors.lightestGrey};
  border-radius: 4px;
`;

const FileName = styled.span`
  font-family: ${fonts.mainFont};
  font-size: 12px;
  color: ${colors.gray};
  font-weight: 500;
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileSize = styled.span`
  font-family: ${fonts.mainFont};
  font-size: 11px;
  color: ${colors.grayishBlue};
  margin-left: 10px;
`;

const UploadButton = styled(Button)`
  align-self: flex-start;

  @media (max-width: ${breakpoints.md}) {
    width: 100%;
  }
`;

export default ResponsiveImageUpload;
