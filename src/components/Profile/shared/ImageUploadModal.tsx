import React, { useState } from 'react';
import { Modal, Alert } from 'react-bootstrap';
import 'react-image-crop/dist/ReactCrop.css';
import ImageUpload from '../../shared/ImageUpload';
import Button from '../../../genericComponents/Button';

interface ImageUploadModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (imageUrl: string) => void;
  editProfile: any;
  currentImgUrl: string;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  show,
  onHide,
  onSave,
  currentImgUrl
}) => {
  const [error, setError] = useState('');

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header>
        <Modal.Title>Profile Picture</Modal.Title>
        <Button onClick={onHide} text="Cancel" type="danger" variant="danger" />
      </Modal.Header>
      {error && <Alert variant="danger">{error}</Alert>}
      <ImageUpload onSave={onSave} currentImgUrl={currentImgUrl} />
    </Modal>
  );
};

export default ImageUploadModal;
