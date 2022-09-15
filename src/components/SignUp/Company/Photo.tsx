import { faCamera, faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import Button from '../../../genericComponents/Button';
import { colors, fonts } from '../../../theme/styleVars';
import SignUpHeader from '../shared/Header';

const CompanyPhoto: React.FC<{
  setForm: SetForm;
  formData: { [key: string]: any };
  formErrors: any;
  setFormErrors: (x: any) => void;
  hasErrorCallback: (step: string, hasErrors: boolean) => void;
}> = () => {
  return (
    <Container>
      <Row>
        <SignUpHeader
          title="Add a theatre photo"
          subtitle="Your logo? A group photo?"
        />
      </Row>
      <Row>
        <Col lg="4">
          <Form>
            <Form.Group>
              <PhotoContainer>
                <FontAwesomeIcon className="camera" icon={faCamera} size="lg" />
              </PhotoContainer>
            </Form.Group>
          </Form>
        </Col>
        <ButtonColumn lg="4">
          <Row style={{ minHeight: '50%' }}>
            <Col style={{ height: 'auto' }}>
              <Button
                onClick={() => null}
                text="Choose File"
                type="button"
                variant="secondary"
              />

              <HelperText>File size restrictions?</HelperText>
            </Col>
          </Row>
          <Row style={{ minHeight: '50%' }}>
            <Col style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0 }}>
                <FileName>file_name.jpg</FileName>
                <Button
                  onClick={() => null}
                  text="Upload"
                  type="button"
                  variant="secondary"
                />
              </div>
            </Col>
          </Row>
        </ButtonColumn>
      </Row>
    </Container>
  );
};

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
  letter-spacing: 0.4000000059604645px;
  margin-top: 17px;
`;

const PhotoContainer = styled.div`
  align-items: center;
  background: ${colors.lightGrey};
  color: white;
  display: flex;
  font-size: 86px;
  justify-content: center;
  height: 300px;
  width: 300px;
  border-radius: 8px;
`;

export default CompanyPhoto;
