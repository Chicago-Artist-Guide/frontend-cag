import React from 'react';
import Container from 'react-bootstrap/Container';
import { Col, Form, Row } from 'react-bootstrap';
import { Tagline, Title } from '../layout/Titles';
import { colors } from '../../theme/styleVars';
import Button from '../../genericComponents/Button';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

const Upcoming: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row>
        <Col lg="12">
          <Title>GOT AN UPCOMING FEATURE?</Title>
          <Tagline>Promote your next performance!</Tagline>
        </Col>
      </Row>
      <Row>
        <Col lg="4">
          <Form.Group>
            <PhotoContainer>
              <FontAwesomeIcon className="bod-icon" icon={faImage} size="lg" />
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
          <Form.Group controlId="show-title">
            <Form.Control placeholder="Show Title" type="text" />
          </Form.Group>
          <Form.Group controlId="show-synopsis">
            <Form.Control as="textarea" placeholder="Show synopsis" />
          </Form.Group>
          <Form.Group controlId="industry-code">
            <Form.Control placeholder="Industry code" type="text" />
          </Form.Group>
          <Form.Group controlId="link-to-site-tickets">
            <Form.Control placeholder="Link to Website/Tickets" type="text" />
          </Form.Group>
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
