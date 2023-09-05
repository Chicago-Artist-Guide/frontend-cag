import React, { useState, useCallback } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageUploadModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (imageUrl: string) => void;
  editProfile: any;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  show,
  onHide,
  onSave,
  editProfile
}) => {
  const { firebaseStorage } = useFirebaseContext();
  const [src, setSrc] = useState(null as string | null);
  const [fileName, setFileName] = useState('');
  const [crop, setCrop] = useState<Crop>({
    width: 50,
    height: 50,
    x: 0,
    y: 0,
    unit: '%'
  });
  const [croppedImageBlob, setCroppedImageBlob] = useState(null as Blob | null);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileType, setFileType] = useState('image/jpeg');

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      const file = e.target.files[0];
      setFileType(file.type);
      setFileName(file.name);
      reader.addEventListener('load', () => setSrc(reader.result as string));
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback(
    (crop, pixelCrop) => {
      // Convert crop to blob
      const imageEl =
        document.querySelector<HTMLImageElement>('.ReactCrop__image');
      if (imageEl && crop.width && crop.height) {
        const canvas = document.createElement('canvas');
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(
          imageEl,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          crop.width,
          crop.height
        );

        canvas.toBlob((blob) => {
          setCroppedImageBlob(blob);
        }, fileType);
      }
    },
    [fileType]
  );

  const uploadImage = async () => {
    if (croppedImageBlob && editProfile) {
      const imgRef = ref(
        firebaseStorage,
        `/files-${editProfile?.uid}/${
          editProfile?.account_id
        }-${Date.now()}-${fileName}`
      );
      const uploadTask = uploadBytesResumable(imgRef, croppedImageBlob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Handle progress
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Error uploading image: ' + error.message);
        },
        () => {
          console.log('Uploaded successfully!');

          // download url
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            console.log('Uploaded pfp image url:', url);
            setImageUrl(url);
          });
        }
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Change Profile Picture</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <input
          type="file"
          accept="image/jpeg, image/png, image/gif"
          onChange={onSelectFile}
        />
        {src && (
          <ReactCrop
            crop={crop}
            onChange={(newCrop: Crop) => setCrop(newCrop)}
            onComplete={onCropComplete}
          >
            <img className="ReactCrop__image" src={src} />
          </ReactCrop>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={uploadImage}>
          Upload
        </Button>
        <Button
          variant="success"
          onClick={() => onSave(imageUrl)}
          disabled={!imageUrl}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageUploadModal;
