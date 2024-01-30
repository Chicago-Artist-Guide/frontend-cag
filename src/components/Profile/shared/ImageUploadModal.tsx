import React, { useState } from 'react';
import { Modal, Alert } from 'react-bootstrap';
import 'react-image-crop/dist/ReactCrop.css';
import ImageUpload from '../../shared/ImageUpload';

interface ImageUploadModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (imageUrl: string) => void;
  editProfile: any;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  show,
  onHide,
  onSave
}) => {
  const [error, setError] = useState('');

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Profile Picture</Modal.Title>
      </Modal.Header>
      {error && <Alert variant="danger">{error}</Alert>}
      <ImageUpload onSave={onSave} />
    </Modal>
  );
};

export default ImageUploadModal;
