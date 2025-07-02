import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useState, useCallback } from 'react';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import ResponsiveImageUpload from '../../shared/ResponsiveImageUpload';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useUserContext } from '../../../context/UserContext';
import { breakpoints } from '../../../theme/styleVars';
import { Profile } from '../Company/types';

const FormPhoto: React.FC<{
  name: string;
  src?: string;
  onChange: SetForm;
}> = ({ src, name, onChange }) => {
  const { firebaseStorage } = useFirebaseContext();
  const {
    profile: { data }
  }: { profile: { data: Profile } } = useUserContext();
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(
    src
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = useCallback((file: File) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setCurrentImageUrl(previewUrl);
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file || !data?.account_id) {
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      const storageRef = ref(
        firebaseStorage,
        `/files/${data.account_id}/${file.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (err) => {
          console.error('Error uploading image', err);
          setIsUploading(false);
        },
        () => {
          setIsUploading(false);
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setCurrentImageUrl(url);
            onChange({ target: { name: name, value: url } });
          });
        }
      );
    },
    [firebaseStorage, data?.account_id, name, onChange]
  );

  return (
    <ResponsiveImageContainer>
      <ResponsiveImageUpload
        onFileSelect={handleFileSelect}
        onUpload={handleUpload}
        currentImageUrl={currentImageUrl}
        accept="image/*"
        maxSize={5 * 1024 * 1024} // 5MB
        disabled={isUploading}
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        helperText="File size limit: 5MB. Recommended: .png, .jpg"
      />
    </ResponsiveImageContainer>
  );
};

const ResponsiveImageContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;

  @media (max-width: ${breakpoints.md}) {
    max-width: 100%;
  }
`;

export default FormPhoto;
