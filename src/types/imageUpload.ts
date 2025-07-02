/**
 * Image upload and cropping type definitions
 */

export type ImageType = 'user' | 'poster' | 'production' | 'company';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropResult {
  croppedAreaPixels: CropArea;
  croppedAreaPercentages: CropArea;
}

export interface ImageUploadConfig {
  maxSizeInMB: number;
  allowedTypes: string[];
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  showGrid?: boolean;
}

export interface ImageUploadCallbacks {
  onFileSelect?: (file: File) => void;
  onUpload?: (file: File) => void;
  onCropComplete?: (cropResult: CropResult) => void;
  onSave?: (imageUrl: string, file?: File) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

export interface ImageUploadState {
  selectedFile: File | null;
  previewUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  currentStep: 'upload' | 'crop' | 'uploading';
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FirebaseUploadResult {
  url: string;
  path: string;
  metadata?: any;
}

/**
 * Default configurations for different image types
 */
export const IMAGE_TYPE_CONFIGS: Record<ImageType, ImageUploadConfig> = {
  user: {
    maxSizeInMB: 5,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    aspectRatio: 1,
    cropShape: 'round',
    showGrid: true
  },
  poster: {
    maxSizeInMB: 10,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    aspectRatio: 2 / 3,
    cropShape: 'rect',
    showGrid: true
  },
  production: {
    maxSizeInMB: 10,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    aspectRatio: 16 / 9,
    cropShape: 'rect',
    showGrid: true
  },
  company: {
    maxSizeInMB: 5,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    aspectRatio: 1,
    cropShape: 'rect',
    showGrid: true
  }
};

/**
 * Helper text for different image types
 */
export const IMAGE_TYPE_HELPER_TEXT: Record<ImageType, string> = {
  user: 'Upload your profile picture. File size limit: 5MB. Recommended: .png, .jpg',
  poster:
    'Upload a poster image. File size limit: 10MB. Recommended: .png, .jpg',
  production:
    'Upload a production image. File size limit: 10MB. Recommended: .png, .jpg',
  company:
    'Upload your company logo. File size limit: 5MB. Recommended: .png, .jpg'
};
