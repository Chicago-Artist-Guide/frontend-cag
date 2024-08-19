import React, { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import InputField from '../../../components/shared/Input';
import { colors } from '../../../theme/styleVars';
import { Tagline, Title } from '../../layout/Titles';
import type { IndividualProfile2Data, UpcomingPerformances } from './types';

const Upcoming: React.FC<{
  setForm: SetForm;
  formData: IndividualProfile2Data;
}> = (props) => {
  const { setForm, formData } = props;
  const { upcoming } = formData;
  const [showId, setShowId] = useState(1);
  const [file, setFile] = useState<any>({ 1: '' });
  const [percent, setPercent] = useState({ 1: 0 });
  const [imgUrl, setImgUrl] = useState<{ [key: number]: string | null }>({
    1: null
  });
  const [uploadInProgress, setUploadInProgress] = useState({ 1: false });
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
      year: '',
      group: '',
      role: '',
      director: '',
      musicalDirector: ''
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

  const numUpcomingShows = upcoming.length;

  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>GOT AN UPCOMING FEATURE?</Title>
          <Tagline>Promote your next performance!</Tagline>
        </Col>
      </Row>
      {upcoming.map((upcomingRow: any) => (
        <PerfRow key={`upcoming-show-row-${upcomingRow.id}`}>
          <Col lg="4">
            <Form.Group className="form-group">
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

const DeleteLinkDiv = styled.div`
  padding: 1em 0;

  a,
  a:hover {
    color: ${colors.salmon};
  }
`;

export default Upcoming;
