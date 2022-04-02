import React from 'react';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import { Col, Form, Row } from 'react-bootstrap';
import { Tagline, Title } from '../layout/Titles';
import Button from '../../genericComponents/Button';
import InputField from '../../genericComponents/Input';
import { colors } from '../../theme/styleVars';

const Upcoming: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { setForm, formData } = props;
  const { upcoming } = formData;

  const onUpcomingInputChange = (
    fieldValue: string,
    fieldName: string,
    i: any
  ) => {
    // indexing to assign each upcoming show value a number
    const newUpcomingShowValues = [...upcoming];
    newUpcomingShowValues[i][fieldName] = fieldValue;

    const target = {
      name: 'upcoming',
      value: newUpcomingShowValues
    };

    setForm({ target });
  };

  const removeUpcomingInput = (i: any) => {
    const newUpcomingShowValues = [...upcoming];
    newUpcomingShowValues.splice(i, 1);

    const target = {
      name: 'upcoming',
      value: newUpcomingShowValues
    };

    setForm({ target });
  };

  const addUpcomingInput = (e: any) => {
    e.preventDefault();
    const newUpcomingShowValues = [...upcoming];

    newUpcomingShowValues.push({
      url: '',
      websiteType: ''
    });

    const target = {
      name: 'upcoming',
      value: newUpcomingShowValues
    };

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
      {upcoming.map((upcomingRow: number, i: any) => (
        <Row key={`upcoming-show-row-${i}`}>
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
                onClick={() => {}}
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
                onUpcomingInputChange(e.target.value || '', 'title', i)
              }
              value={upcoming[i]['title'] || ''}
            />
            <Form.Group controlId="show-synopsis">
              <Form.Control
                as="textarea"
                name="synopsis"
                onChange={(e: any) =>
                  onUpcomingInputChange(e.target.value || '', 'synopsis', i)
                }
                placeholder="Show Synopsis"
                value={upcoming[i]['synopsis'] || ''}
              />
            </Form.Group>
            <InputField
              label="Industry Code"
              name="industryCode"
              onChange={(e: any) =>
                onUpcomingInputChange(e.target.value || '', 'industryCode', i)
              }
              value={upcoming[i]['industryCode'] || ''}
            />
            <InputField
              label="Link to Website/Tickets"
              name="url"
              onChange={(e: any) =>
                onUpcomingInputChange(e.target.value || '', 'url', i)
              }
              placeholder="http://"
              value={upcoming[i]['url'] || ''}
            />
            {numUpcomingShows > 1 && (
              <a href="#" onClick={() => removeUpcomingInput(i)}>
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
