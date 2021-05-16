import React from 'react';
import styled from 'styled-components';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';
import yellow_blob from '../../images/yellow_blob_2.svg';
import Image from 'react-bootstrap/Image';
import { colors, fonts } from '../../theme/styleVars';
import InputField from '../../genericComponents/Input';
import Checkbox from '../../genericComponents/Checkbox';
import { Form } from 'react-bootstrap';

const Privacy: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  return (
    <Container>
      <Row>
        <Title>LET'S GET TO KNOW EACH OTHER</Title>
        <Col lg="8">
          <Form>
            <InputField label="First"></InputField>
            <InputField label="Last"></InputField>
            <InputField label="Email Address"></InputField>
            <InputField label="Password"></InputField>
            <Checkbox> 18 years or older</Checkbox>
            <TermsPrivacyLink to="/terms-of-service">
              View our full terms and privacy policy
            </TermsPrivacyLink>
            <PrivacyPar>
              Tap the button below to agree with our terms and privacy policy
            </PrivacyPar>
          </Form>
        </Col>
        <ImageCol lg="4">
          <Image alt="" src={yellow_blob} />
        </ImageCol>
      </Row>
    </Container>
  );
};

const ImageCol = styled(Col)`
  display: flex;
  max-height: 100%;
  max-width: 100%;
`;

const PrivacyPar = styled.p`
  color: ${colors.mainFont};
  font-family: ${fonts.mainFont};
  font-size: 20px;
  letter-spacing: 0px;
  margin-top: 17px;

  span {
    font-size: 16px;
    color: ${colors.primary};
    font-weight: bold;
  }
`;

const TermsPrivacyLink = styled(Link)`
  color: ${colors.veryDarkGrayBlue};
  font-family: ${fonts.lora};
  font-size: 14px;
  margin-bottom: 18px;
  margin-top: 26px;
`;

const Title = styled.h1`
  font-family: ${fonts.montserrat};
  font-size: 48px;
  font-weight: bold;
`;

export default Privacy;
