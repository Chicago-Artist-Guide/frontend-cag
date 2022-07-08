import React, { useState } from 'react';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import { Col, Form, Row } from 'react-bootstrap';
import { Tagline, Title } from '../../layout/Titles';
import Button from '../../../genericComponents/Button';
import InputField from '../../../genericComponents/Input';
import { colors } from '../../../theme/styleVars';

const Upcoming: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { setForm, formData } = props;
  const { upcoming } = formData;
  const [showId, setShowId] = useState(1);

  const onUpcomingInputChange = (
    fieldValue: string,
    fieldName: string,
    id: any
  ) => {
    // indexing to assign each upcoming show value a number
    const newUpcomingShowValues = [...upcoming];
    const findIndex = newUpcomingShowValues.findIndex(show => show.id === id);
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
    const findIndex = newUpcomingShowValues.findIndex(show => show.id === id);
    newUpcomingShowValues.splice(findIndex, 1);

    const target = {
      name: 'upcoming',
      value: newUpcomingShowValues
    };

    setForm({ target });
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
      {upcoming.map((upcomingRow: any, i: any) => (
        <Row key={`upcoming-show-row-${upcomingRow.id}`}>
          <Col lg="4">
            <Form.Group>
              <PhotoContainer>
                <FontAwesomeIcon
                  className="bod-icon"
                  icon={faImage}
                  size="lg"
                />
              </PhotoContainer>
              <Button
                onClick={() => null}
                text="Choose File"
                type="button"
                variant="secondary"
              />
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
            <Form.Group controlId="show-synopsis">
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
            </Form.Group>
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
            {numUpcomingShows > 1 && (
              <a
                href="#"
                onClick={(e: any) => removeUpcomingInput(e, upcomingRow.id)}
              >
                X
              </a>
            )}
          </Col>
        </Row>
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

const PhotoContainer = styled.div`
  align-items: center;
  background: ${colors.lightGrey};
  color: white;
  display: flex;
  font-size: 68px;
  height: 300px;
  justify-content: center;
  width: 100%;
`;

export default Upcoming;
