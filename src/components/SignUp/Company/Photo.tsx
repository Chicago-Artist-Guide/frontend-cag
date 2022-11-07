import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useRef, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import Button from '../../../genericComponents/Button';
import { colors, fonts } from '../../../theme/styleVars';
import SignUpBody from '../shared/Body';
import SignUpHeader from '../shared/Header';
import { CompanyData } from './types';

const CompanyPhoto: React.FC<{
  setForm: SetForm;
  formValues: CompanyData;
  setStepErrors: (step: string, hasErrors: boolean) => void;
}> = ({ setForm }) => {
  const { firebaseStorage } = useFirebaseContext();
  const [file, setFile] = useState<File | null>(null);
  const [percent, setPercent] = useState(0);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const uploadFile = () => {
    if (!file) {
      return;
    }

    setUploadInProgress(true);

    const storageRef = ref(firebaseStorage, `/files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      snapshot => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setPercent(percent);
      },
      err => {
        console.log('Error uploading image', err);
        setUploadInProgress(false);
      },
      () => {
        setUploadInProgress(false);
        getDownloadURL(uploadTask.snapshot.ref).then(url => {
          setImgUrl(url);
          const target = {
            name: 'profilePhotoUrl',
            value: url
          };
          setForm({ target });
        });
      }
    );
  };

  const onFileChange = (e: any) => {
    const imgFile = e.target.files[0];
    if (imgFile) {
      setFile(imgFile);
      setImgUrl(URL.createObjectURL(imgFile));
    }
  };

  const handleFileInput = () => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  };

  return (
    <Container>
      <Row>
        <SignUpHeader
          title="Add a theatre photo"
          subtitle="Your logo? A group photo?"
        />
      </Row>
      <Row>
        <SignUpBody lg="4">
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
        </SignUpBody>
        <ButtonColumn lg="4">
          <Row style={{ minHeight: '50%' }}>
            <Col style={{ height: 'auto' }}>
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
            </Col>
          </Row>
          <Row style={{ minHeight: '50%' }}>
            <Col style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0 }}>
                <FileName>{file && file.name}</FileName>
                <UploadRow>
                  <Button
                    disabled={uploadInProgress || !file}
                    onClick={uploadFile}
                    text="Upload"
                    type="button"
                    variant="secondary"
                  />
                  {uploadInProgress && (
                    <Progress>Upload progress: {percent}%</Progress>
                  )}
                </UploadRow>
              </div>
            </Col>
          </Row>
        </ButtonColumn>
      </Row>
    </Container>
  );
};

const UploadRow = styled(Row)`
  padding-left: 15px;
  display: flex;
  align-items: center;
`;

const Progress = styled.div`
  font-weight: 200;
  font-size: 16px;
  margin-left: 10px;
`;

const ButtonColumn = styled(Col)`
  max-height: 300px;
`;

const FileName = styled.div`
  font-size: 12px;
  margin-bottom: 16px;
`;

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
  height: 300px;
  width: 300px;
  border-radius: 8px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
`;

export default CompanyPhoto;
