import { CropArea, ImageType } from '../types/imageUpload';

/**
 * Creates a cropped image from the original image and crop area
 */
export const createCroppedImage = (
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const rotRad = (rotation * Math.PI) / 180;

      // calculate bounding box of the rotated image
      const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
      );

      // set canvas size to match the bounding box
      canvas.width = bBoxWidth;
      canvas.height = bBoxHeight;

      // translate canvas context to a central location to allow rotating and flipping around the center
      ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
      ctx.rotate(rotRad);
      ctx.scale(1, 1);
      ctx.translate(-image.width / 2, -image.height / 2);

      // draw rotated image
      ctx.drawImage(image, 0, 0);

      // croppedAreaPixels values are bounding box relative
      // extract the cropped image using these values
      const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
      );

      // set canvas width to final desired crop size - this will clear existing context
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // paste extracted crop on cleared canvas
      ctx.putImageData(data, 0, 0);

      // As a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas is empty'));
          }
        },
        'image/jpeg',
        0.9
      );
    };
    image.onerror = (error) => {
      reject(new Error('Failed to load image: ' + error));
    };
  });
};

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
  };
};

/**
 * Converts a blob to a File object
 */
export const blobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now()
  });
};

/**
 * Creates a data URL from a blob
 */
export const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
};

/**
 * Gets the aspect ratio for different image types
 */
export const getAspectRatio = (type: ImageType): number => {
  switch (type) {
    case 'user':
      return 1; // Square for profile pictures
    case 'poster':
      return 2 / 3; // Portrait aspect ratio for posters
    case 'production':
      return 16 / 9; // Landscape for production images
    case 'company':
      return 1; // Square for company logos
    default:
      return 1;
  }
};

/**
 * Validates image file type and size
 */
export const validateImageFile = (
  file: File,
  maxSizeInMB = 5,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
): { isValid: boolean; error?: string } => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.map((type) => type.split('/')[1]).join(', ')}`
    };
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File is too large. Maximum size is ${maxSizeInMB}MB`
    };
  }

  return { isValid: true };
};
