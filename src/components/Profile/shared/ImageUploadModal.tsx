import React from 'react';
import ResponsiveImageUploadModal from '../../shared/ResponsiveImageUploadModal';

type ImageUploadType = 'User' | 'Poster';

interface ImageUploadModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (imageUrl: string) => void;
  editProfile?: any; // Legacy prop, kept for compatibility
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
  // Convert legacy type to new image type format
  const imageType = type === 'User' ? 'user' : 'poster';

  // Get appropriate title based on type
  const getTitle = () => {
    switch (type) {
      case 'User':
        return 'Upload Profile Picture';
      case 'Poster':
        return 'Upload Poster Image';
      default:
        return 'Upload Image';
    }
  };

  return (
    <ResponsiveImageUploadModal
      show={show}
      onHide={onHide}
      onSave={onSave}
      currentImageUrl={currentImgUrl}
      imageType={imageType}
      title={getTitle()}
      maxSizeInMB={5}
    />
  );
};

export default ImageUploadModal;
