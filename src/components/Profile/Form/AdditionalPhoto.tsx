import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useRef, useState } from 'react';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useProfileContext } from '../../../context/ProfileContext';
import { colors } from '../../../theme/styleVars';
import { Profile } from '../Company/types';

const AdditionalPhoto: React.FC<{
  index: number;
  name: string;
  src?: string;
  onChange: SetForm;
}> = ({ index, src, name, onChange }) => {
  const { firebaseStorage } = useFirebaseContext();
  const {
    profile: { data }
  }: { profile: { data: Profile } } = useProfileContext();
  const [imgUrl, setImgUrl] = useState<string | undefined>(src);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const handleFileInput = () => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  };

  const onFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImgUrl(URL.createObjectURL(file));
      const storageRef = ref(
        firebaseStorage,
        `/files-${data.account_id}/${file.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.then(() => {
        getDownloadURL(uploadTask.snapshot.ref).then(url => {
          setImgUrl(url);
          onChange({
            target: {
              name: name,
              value: url
            }
          });
        });
      });
    }
  };

  return (
    <>
      <Image
        onClick={handleFileInput}
        style={{
          backgroundImage: imgUrl !== null ? `url(${imgUrl})` : undefined
        }}
      />
      <input
        accept="image/*"
        id={`icon-button-file_${index}`}
        type="file"
        style={{ display: 'none' }}
        ref={fileInput}
        onChange={onFileChange}
      />
    </>
  );
};

const Image = styled.div`
  box-shadow: 0 0 8px 4px ${colors.black05a};
  cursor: pointer;
  align-items: center;
  background: ${colors.lightGrey};
  color: white;
  display: flex;
  font-size: 86px;
  justify-content: center;
  height: 95px;
  width: 96px;
  margin-bottom: 10px;
  border-radius: 8px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
`;

export default AdditionalPhoto;
