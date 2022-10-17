import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import Button from '../../../genericComponents/Button';
import { Tagline, Title } from '../../layout/Titles';
import { colors } from '../../../theme/styleVars';
import yellow_blob from '../../../images/yellow_blob_2.svg';

const ProfilePhoto: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { setForm } = props;
  const { firebaseStorage } = useFirebaseContext();
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

    const storageRef = ref(firebaseStorage, `/files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      snapshot => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        // update progress
        setPercent(percent);
      },
      err => {
        console.log('Error uploading image', err);
        setUploadInProgress(false);
      },
      () => {
        setUploadInProgress(false);

        // download url
        getDownloadURL(uploadTask.snapshot.ref).then(url => {
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
