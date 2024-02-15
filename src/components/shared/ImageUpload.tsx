import React, { useState, useCallback, useRef } from 'react';
import { Container } from 'styled-bootstrap-grid';
import Row from 'react-bootstrap/Row';
import { Col } from 'react-bootstrap';
import { colors } from '../../theme/styleVars';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { useProfileContext } from '../../context/ProfileContext';
import Button from '../../genericComponents/Button';
import ReactCrop, { Crop } from 'react-image-crop';
import { v4 as uuidv4 } from 'uuid';

interface ImageUploadModalProps {
  onSave: (imageUrl: string) => void;
  currentImgUrl: string;
}

const ImageUpload: React.FC<ImageUploadModalProps> = ({
  onSave,
  currentImgUrl
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [croppedImageBlob, setCroppedImageBlob] = useState(null as Blob | null);
  const { firebaseStorage } = useFirebaseContext();
  const [percent, setPercent] = useState(0);
  const [imgUrl, setImgUrl] = useState<string | null>(currentImgUrl);
  const [src, setSrc] = useState(null as string | null);
  const {
    profile: { data }
  } = useProfileContext();
  const [crop, setCrop] = useState<Crop>({
    width: 50,
    height: 50,
    x: 0,
    y: 0,
    unit: 'px'
  });

  const imageId = uuidv4();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      const file = e.target.files[0];
      setFile(file);
      reader.addEventListener('load', () => setSrc(reader.result as string));
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = () => {
    if (!croppedImageBlob) {
      return;
    }

    setUploadInProgress(true);

    const storageRef = ref(firebaseStorage, `/${imageId}-${file?.name}`);
    const uploadTask = uploadBytesResumable(storageRef, croppedImageBlob);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const currentPercent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setPercent(currentPercent);
      },
      (err) => {
        console.log('Error uploading image', err);
        setUploadInProgress(false);
      },
      () => {
        // download url
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log('Uploaded image url:', url);
          onSave(url);
        });
      }
    );
  };

  const onCropComplete = useCallback(
    (crop, pixelCrop) => {
      const imageEl =
        document.querySelector<HTMLImageElement>('.ReactCrop__image');
      if (imageEl && crop.width && crop.height) {
        const canvas = document.createElement('canvas');
        const scaleX = imageEl.naturalWidth / imageEl.width;
        const scaleY = imageEl.naturalHeight / imageEl.height;
        const targetX = (imageEl.width * pixelCrop.x * scaleX) / 100;
        const targetY = (imageEl.height * pixelCrop.y * scaleY) / 100;
        const targetWidth = (imageEl.width * pixelCrop.width * scaleX) / 100;
        const targetHeight = (imageEl.height * pixelCrop.height * scaleY) / 100;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(
          imageEl,
          targetX,
          targetY,
          targetWidth,
          targetHeight,
          0,
          0,
          crop.width,
          crop.height
        );
        canvas.toBlob((blob) => {
          setCroppedImageBlob(blob);
        }, file?.type);
      }
    },
    [file?.type]
  );

  const ChooseFileUploadButtons = () => {
    return (
      <StyledRow>
        <Col>
          <>
            <Button
              disabled={uploadInProgress}
              onClick={() => fileInputRef?.current?.click()}
              text="Choose File"
              type="button"
              variant="secondary"
            />
            <input
              onChange={onFileChange}
              multiple={false}
              ref={fileInputRef}
              type="file"
              hidden
            />
            <ButtonLabel>File size limit: 5MB</ButtonLabel>
          </>
        </Col>
        <Col>
          {file && (
            <>
              <Button
                disabled={uploadInProgress}
                onClick={uploadFile}
                text="Upload File"
                type="button"
                variant="secondary"
              />
              {uploadInProgress ? (
                <ButtonLabel>Upload progress: {percent}%</ButtonLabel>
              ) : (
                <ButtonLabel>{file.name}</ButtonLabel>
              )}
            </>
          )}
        </Col>
      </StyledRow>
    );
  };

  return (
    <Container>
      <ChooseFileUploadButtons />
      {src ? (
        <CropContainer>
          <ReactCrop
            crop={crop}
            onChange={(newCrop: Crop) => setCrop(newCrop)}
            onComplete={onCropComplete}
            aspect={1}
          >
            <img className="ReactCrop__image" src={src} />
          </ReactCrop>
        </CropContainer>
      ) : (
        <PhotoContainer
          style={{
            backgroundImage: imgUrl !== null ? `url(${imgUrl})` : undefined
          }}
        >
          {imgUrl === null ||
            (imgUrl === undefined && (
              <PlaceholderImage>
                <FontAwesomeIcon
                  className="bod-icon"
                  icon={faCamera}
                  size="lg"
                />
              </PlaceholderImage>
            ))}
        </PhotoContainer>
      )}
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
`;

const CropContainer = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;

const StyledRow = styled(Row)`
  margin-top: 20px;
  margin-bottom: 25px;
`;

const ButtonLabel = styled.p`
  padding-top: 10px;
`;

const PlaceholderImage = styled.div`
  background: ${colors.lightGrey};
  color: white;
  display: flex;
  font-size: 68px;
  height: 300px;
  width: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
`;

export default ImageUpload;
