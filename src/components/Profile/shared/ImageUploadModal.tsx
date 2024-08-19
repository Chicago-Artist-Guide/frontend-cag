import React, { useState } from 'react';
import { Alert, Modal } from 'react-bootstrap';
import 'react-image-crop/dist/ReactCrop.css';
import Button from '../../../components/shared/Button';
import ImageUpload from '../../shared/ImageUpload';

type ImageUploadType = 'User' | 'Poster';

interface ImageUploadModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (imageUrl: string) => void;
  editProfile: any;
  currentImgUrl: string;
  type: ImageUploadType;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  show,
  onHide,
  onSave,
  currentImgUrl,
  type
}) => {
  const [error] = useState('');

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header>
        <Modal.Title>Profile Picture</Modal.Title>
        <Button onClick={onHide} text="Cancel" type="danger" variant="danger" />
      </Modal.Header>
      {error && <Alert variant="danger">{error}</Alert>}
      <ImageUpload
        onSave={onSave}
        currentImgUrl={currentImgUrl}
        modal={true}
        type={type}
      />
    </Modal>
  );
};

export default ImageUploadModal;
