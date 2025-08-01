import { uuidv4 } from '@firebase/util';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useCallback, useRef, useState } from 'react';
import { Col } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import ReactCrop, { Crop } from 'react-image-crop';
import { Container } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { useUserContext } from '../../context/UserContext';
import Button from './Button';
import { colors } from '../../theme/styleVars';

type ImageUploadType = 'User' | 'Poster';

interface ImageUploadModalProps {
  onSave: (imageUrl: string) => void;
  currentImgUrl: string | undefined;
  modal: boolean;
  type: ImageUploadType;
  productionId?: string; // Add production ID for production images
}

const ImageUpload: React.FC<ImageUploadModalProps> = ({
  onSave,
  currentImgUrl: imgUrl = '',
  modal,
  type,
  productionId
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [croppedImageBlob, setCroppedImageBlob] = useState(null as Blob | null);
  const { firebaseStorage } = useFirebaseContext();
  const {
    profile: { data }
  } = useUserContext();
  const [percent, setPercent] = useState(0);
  const [src, setSrc] = useState(null as string | null);
  const [crop, setCrop] = useState<Crop>({
    height: type === 'User' ? 50 : 50 / (2 / 3),
    width: 50,
    x: 0,
    y: 0,
    unit: 'px'
  });

  const imageId = uuidv4();
  const placeholderUrl =
    'https://firebasestorage.googleapis.com/v0/b/chicago-artist-guide-dev.appspot.com/o/5a35def2-4f2e-42ac-b619-c6bfa2a5bd11-1234.png?alt=media&token=45772221-1f35-40be-b134-e60f84494b5f';

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

    // Determine storage path based on type
    let storagePath: string;
    if (type === 'User') {
      // Profile picture
      storagePath = `/profiles/${data.uid}/profile-picture/${file?.name}`;
    } else if (type === 'Poster' && productionId) {
      // Production image
      storagePath = `/productions/${productionId}/images/${file?.name}`;
    } else {
      // Fallback to general user uploads
      storagePath = `/users/${data.uid}/uploads/${file?.name}`;
    }

    const storageRef = ref(firebaseStorage, storagePath);
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

  const MobileButtons = () => {
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
                text="Upload"
                type="button"
                variant="success"
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

  const DesktopButtons = () => {
    return (
      <Col>
        <StyledMargin>
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
        </StyledMargin>
        {file && (
          <>
            <Button
              disabled={uploadInProgress}
              onClick={uploadFile}
              text="Upload"
              type="button"
              variant="success"
            />
            {uploadInProgress ? (
              <ButtonLabel>Upload progress: {percent}%</ButtonLabel>
            ) : (
              <ButtonLabel>{file.name}</ButtonLabel>
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
        {src ? (
          <CropContainer>
            <ReactCrop
              crop={crop}
              onChange={(newCrop: Crop) => setCrop(newCrop)}
              onComplete={onCropComplete}
              aspect={type === 'User' ? 1 : 2 / 3}
            >
              <img className="ReactCrop__image" src={src} />
            </ReactCrop>
          </CropContainer>
        ) : (
          <PhotoContainer
            style={{
              backgroundImage:
                imgUrl !== null ? `url(${imgUrl})` : `url(${placeholderUrl})`
            }}
          ></PhotoContainer>
        )}
        {!modal && <DesktopButtons />}
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
`;

const CropContainer = styled.div`
  margin-bottom: 20px;
  text-align: center;
  justify-content: center;
  align-items: center;
`;

const StyledRow = styled(Row)`
  margin-top: 20px;
  margin-bottom: 25px;
`;

const ButtonLabel = styled.p`
  padding-top: 10px;
`;

const StyledMargin = styled.div`
  margin-bottom: 20px;
`;

export default ImageUpload;
