import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import Button from '../../../components/shared/Button';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useUserContext } from '../../../context/UserContext';
import yellow_blob from '../../../images/yellow_blob_2.svg';
import { colors } from '../../../theme/styleVars';
import { Tagline, Title } from '../../layout/Titles';
import type { IndividualData } from './types';

const ProfilePhoto: React.FC<{
  setForm: SetForm;
  formData: IndividualData;
}> = (props) => {
  const { setForm } = props;
  const { firebaseStorage } = useFirebaseContext();
  const {
    profile: { data }
  } = useUserContext();
  const [file, setFile] = useState<File | null>(null);
  const [percent, setPercent] = useState(0);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);

  const onFileChange = (e: any) => {
    const imgFile = e.target.files[0];
    if (imgFile) {
      setFile(imgFile);
    }
  };

  const uploadFile = () => {
    if (!file) {
      return;
    }

    // start upload
    setUploadInProgress(true);

    const storageRef = ref(
      firebaseStorage,
      `/files-${data.uid}/${data.account_id}-${file.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        // update progress
        setPercent(percent);
      },
      (err) => {
        console.log('Error uploading image', err);
        setUploadInProgress(false);
      },
      () => {
        setUploadInProgress(false);

        // download url
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log('Uploaded image url:', url);
          setImgUrl(url);
        });
      }
    );
  };

  useEffect(() => {
    if (imgUrl !== null && imgUrl !== '') {
      const target = {
        name: 'profilePhotoUrl',
        value: imgUrl
      };

      setForm({ target });
    }
  }, [imgUrl]);

  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>LET'S PUT A FACE TO THE NAME</Title>
          <Tagline>
            We just need one for now, but you can add more later.
          </Tagline>
          <PhotoUploadRow>
            <Col lg="4">
              <PhotoContainer
                style={{
                  backgroundImage:
                    imgUrl !== null ? `url(${imgUrl})` : undefined
                }}
              >
                {imgUrl === null && (
                  <FontAwesomeIcon
                    className="bod-icon"
                    icon={faCamera}
                    size="lg"
                  />
                )}
              </PhotoContainer>
            </Col>
            <ButtonCol lg="4">
              <Form.Group className="form-group">
                <Form.Label>File size limit: 5MB</Form.Label>
                <Form.Control
                  accept="image/*"
                  onChange={onFileChange}
                  type="file"
                  style={{
                    padding: 0,
                    border: 'none'
                  }}
                />
              </Form.Group>
              <div>
                <Button
                  disabled={uploadInProgress || !file}
                  onClick={uploadFile}
                  text="Upload File"
                  type="button"
                  variant="secondary"
                />
              </div>
              {uploadInProgress && <p>Upload progress: {percent}%</p>}
            </ButtonCol>
            <ImageCol lg="4">
              <Image alt="" src={yellow_blob} />
            </ImageCol>
          </PhotoUploadRow>
        </Col>
      </Row>
    </Container>
  );
};

const PhotoUploadRow = styled(Row)`
  margin-top: 40px;
`;

const PhotoContainer = styled.div`
  align-items: center;
  background: ${colors.lightGrey};
  color: white;
  display: flex;
  font-size: 68px;
  height: 300px;
  justify-content: center;
  width: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;

const ButtonCol = styled(Col)`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-top: 40px;

  p {
    font-style: italic;
    padding-top: 12px;
  }
`;

const ImageCol = styled(Col)`
  display: flex;
  max-height: 100%;
  max-width: 100%;
`;

export default ProfilePhoto;
