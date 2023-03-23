import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import { Col, Form, Row } from 'react-bootstrap';
import { SetForm } from 'react-hooks-helper';
import { Tagline, Title } from '../../layout/Titles';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import Button from '../../../genericComponents/Button';
import InputField from '../../../genericComponents/Input';
import { colors } from '../../../theme/styleVars';
import type { IndividualProfile2Data, UpcomingPerformances } from './types';

const Upcoming: React.FC<{
  setForm: SetForm;
  formData: IndividualProfile2Data;
}> = (props) => {
  const { setForm, formData } = props;
  const { upcoming } = formData;
  const [showId, setShowId] = useState(1);
  const { firebaseStorage } = useFirebaseContext();
  const [file, setFile] = useState<any>({ 1: '' });
  const [percent, setPercent] = useState({ 1: 0 });
  const [imgUrl, setImgUrl] = useState<{ [key: number]: string | null }>({
    1: null
  });
  const [uploadInProgress, setUploadInProgress] = useState({ 1: false });

  const onFileChange = (e: any, id: number) => {
    const imgFile = e.target.files[0];

    if (imgFile) {
      const currFiles = { ...file };
      setFile({ ...currFiles, [id]: imgFile });
    }
  };

  const uploadFile = (id: number) => {
    if (!file[id]) {
      return;
    }

    // get file
    const currFile = file[id];

    // start upload
    const currUploadProg = { ...uploadInProgress };
    setUploadInProgress({ ...currUploadProg, [id]: true });

    const storageRef = ref(firebaseStorage, `/files/${currFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, currFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const currPercent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        // update progress
        const currProgress = { ...percent };
        setPercent({ ...currProgress, [id]: currPercent });
      },
      (err) => {
        console.log('Error uploading image', err);
        setUploadInProgress({ ...currUploadProg, [id]: false });
      },
      () => {
        setUploadInProgress({ ...currUploadProg, [id]: false });

        // download url
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log('Uploaded image url:', url);
          const currImgUrl = { ...imgUrl };
          setImgUrl({ ...currImgUrl, [id]: url });
        });
      }
    );
  };

  const onUpcomingInputChange = <T extends keyof UpcomingPerformances>(
    fieldValue: UpcomingPerformances[T],
    fieldName: T,
    id: any
  ) => {
    // indexing to assign each upcoming show value a number
    const newUpcomingShowValues = [...upcoming];
    const findIndex = newUpcomingShowValues.findIndex((show) => show.id === id);
    newUpcomingShowValues[findIndex][fieldName] = fieldValue;

    const target = {
      name: 'upcoming',
      value: newUpcomingShowValues
    };

    setForm({ target });
  };

  const removeUpcomingInput = (e: any, id: any) => {
    e.preventDefault();
    const newUpcomingShowValues = [...upcoming];
    const findIndex = newUpcomingShowValues.findIndex((show) => show.id === id);
    newUpcomingShowValues.splice(findIndex, 1);

    const target = {
      name: 'upcoming',
      value: newUpcomingShowValues
    };

    setForm({ target });

    const newFile = { ...file };
    const newPercent = { ...percent };
    const newImgUrl = { ...imgUrl };
    const newUploadInProgress = { ...uploadInProgress };

    delete newFile[id];
    delete (newPercent as any)[id];
    delete newImgUrl[id];
    delete (newUploadInProgress as any)[id];

    setFile(newFile);
    setPercent(newPercent);
    setImgUrl(newImgUrl);
    setUploadInProgress(newUploadInProgress);
  };

  const addUpcomingInput = (e: any) => {
    e.preventDefault();
    const newUpcomingShowValues = [...upcoming];
    const newShowId = showId + 1;

    newUpcomingShowValues.push({
      id: newShowId,
      title: '',
      synopsis: '',
      industryCode: '',
      url: '',
      imageUrl: ''
    });

    const target = {
      name: 'upcoming',
      value: newUpcomingShowValues
    };

    setShowId(newShowId);
    setForm({ target });

    const newFile = { ...file, [newShowId]: '' };
    const newPercent = { ...percent, [newShowId]: 0 };
    const newImgUrl = { ...imgUrl, [newShowId]: null };
    const newUploadInProgress = { ...uploadInProgress, [newShowId]: false };

    setFile(newFile);
    setPercent(newPercent);
    setImgUrl(newImgUrl);
    setUploadInProgress(newUploadInProgress);
  };

  useEffect(() => {
    upcoming.forEach((upcomingShow: any) => {
      const showId = upcomingShow.id;
      const showImgUrl = imgUrl[showId] ?? false;

      if (showImgUrl) {
        onUpcomingInputChange(showImgUrl, 'imageUrl', showId);
      }
    });
  }, [imgUrl]);

  const numUpcomingShows = upcoming.length;

  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>GOT AN UPCOMING FEATURE?</Title>
          <Tagline>Promote your next performance!</Tagline>
        </Col>
      </Row>
      {upcoming.map((upcomingRow: any, i: any) => (
        <PerfRow key={`upcoming-show-row-${upcomingRow.id}`}>
          <Col lg="4">
            <Form.Group className="form-group">
              <PhotoContainer
                style={{
                  backgroundImage:
                    imgUrl[upcomingRow.id] !== null
                      ? `url(${imgUrl[upcomingRow.id]})`
                      : undefined
                }}
              >
                {imgUrl[upcomingRow.id] === null && (
                  <FontAwesomeIcon
                    className="bod-icon"
                    icon={faImage}
                    size="lg"
                  />
                )}
              </PhotoContainer>
              <Form.Group className="form-group">
                <Form.Label>File size limit: 5MB</Form.Label>
                <Form.Control
                  accept="image/*"
                  onChange={(e: any) => onFileChange(e, upcomingRow.id)}
                  style={{
                    padding: 0,
                    border: 'none'
                  }}
                  type="file"
                />
              </Form.Group>
              <div>
                <Button
                  disabled={
                    (uploadInProgress as any)[upcomingRow.id] ||
                    file[upcomingRow.id] === ''
                  }
                  onClick={() => uploadFile(upcomingRow.id)}
                  text="Upload File"
                  type="button"
                  variant="secondary"
                />
              </div>
              {(uploadInProgress as any)[upcomingRow.id] && (
                <p>Upload progress: {(percent as any)[upcomingRow.id]}%</p>
              )}
              <DeleteLinkDiv>
                {numUpcomingShows > 1 && (
                  <a
                    href="#"
                    onClick={(e: any) => removeUpcomingInput(e, upcomingRow.id)}
                  >
                    X Delete Show
                  </a>
                )}
              </DeleteLinkDiv>
            </Form.Group>
          </Col>
          <Col lg="8">
            <InputField
              label="Show Title"
              name="title"
              onChange={(e: any) =>
                onUpcomingInputChange(
                  e.target.value || '',
                  'title',
                  upcomingRow.id
                )
              }
              value={upcomingRow.title}
            />
            <SynopsisTextarea controlId="show-synopsis">
              <Form.Control
                as="textarea"
                name="synopsis"
                onChange={(e: any) =>
                  onUpcomingInputChange(
                    e.target.value || '',
                    'synopsis',
                    upcomingRow.id
                  )
                }
                placeholder="Show Synopsis"
                value={upcomingRow.synopsis}
              />
            </SynopsisTextarea>
            <InputField
              label="Industry Code"
              name="industryCode"
              onChange={(e: any) =>
                onUpcomingInputChange(
                  e.target.value || '',
                  'industryCode',
                  upcomingRow.id
                )
              }
              value={upcomingRow.industryCode}
            />
            <WebsiteUrlField>
              <InputField
                label="Link to Website/Tickets"
                name="url"
                onChange={(e: any) =>
                  onUpcomingInputChange(
                    e.target.value || '',
                    'url',
                    upcomingRow.id
                  )
                }
                placeholder="http://"
                value={upcomingRow.url}
              />
            </WebsiteUrlField>
          </Col>
        </PerfRow>
      ))}
      <Row>
        <Col lg="12">
          <div>
            <a href="#" onClick={addUpcomingInput}>
              + Add Upcoming Show
            </a>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

const PerfRow = styled(Row)`
  padding-top: 2em;
  padding-bottom: 2em;

  &:not(:first-child) {
    border-top: 1px solid ${colors.lightGrey};
  }
`;

const PhotoContainer = styled.div`
  align-items: center;
  background: ${colors.lightGrey};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  color: white;
  display: flex;
  font-size: 68px;
  height: 300px;
  justify-content: center;
  width: 100%;
`;

const SynopsisTextarea = styled(Form.Group)`
  margin-top: 12px;
`;

const WebsiteUrlField = styled.div`
  margin-top: 12px;
`;

const DeleteLinkDiv = styled.div`
  padding: 1em 0;

  a,
  a:hover {
    color: ${colors.salmon};
  }
`;

export default Upcoming;
