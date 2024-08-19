import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import Button from '../../../../components/shared/Button';
import { useFirebaseContext } from '../../../../context/FirebaseContext';
import { useUserContext } from '../../../../context/UserContext';
import { colors, fonts } from '../../../../theme/styleVars';

const ProductionPhoto: React.FC<{
  name: string;
  src?: string;
  onChange: SetForm;
}> = ({ name, src, onChange }) => {
  const { firebaseStorage } = useFirebaseContext();
  const {
    profile: { data }
  } = useUserContext();
  const [imgUrl, setImgUrl] = useState<string | null>(src || null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (src) {
      setImgUrl(src);
    }
  }, [src]);

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
        `/files/${data.account_id}/show_images/${file.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.then(() => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
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
    <div>
      <Form.Group className="form-group">
        <PhotoContainer
          onClick={handleFileInput}
          style={{
            backgroundImage: imgUrl !== null ? `url(${imgUrl})` : undefined
          }}
        >
          {!imgUrl && (
            <FontAwesomeIcon className="camera" icon={faCamera} size="lg" />
          )}
        </PhotoContainer>
      </Form.Group>
      <input
        accept="image/*"
        id="icon-button-file"
        type="file"
        style={{ display: 'none' }}
        ref={fileInput}
        onChange={onFileChange}
      />
      <Button
        onClick={handleFileInput}
        text="Choose File"
        type="button"
        variant="secondary"
      />
      <HelperText>File size limit: 5MB</HelperText>
    </div>
  );
};

const HelperText = styled.div`
  font-family: ${fonts.lora};
  font-size: 12px;
  font-style: italic;
  font-weight: 500;
  line-height: 14px;
  letter-spacing: 0.4px;
  margin-top: 17px;
`;

const PhotoContainer = styled.div`
  cursor: pointer;
  align-items: center;
  background: ${colors.lightGrey};
  color: white;
  display: flex;
  font-size: 86px;
  justify-content: center;
  width: 311px;
  height: 497px;
  border-radius: 8px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
`;

export default ProductionPhoto;
