import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import yellow_blob from '../../../images/yellow_blob_2.svg';
import { colors, fonts } from '../../../theme/styleVars';
import SignUpBody from '../shared/Body';
import SignUpHeader from '../shared/Header';

const Privacy: React.FC<{
  setForm: SetForm;
  formData: any;
}> = (props) => {
  const { formData } = props;

  return (
    <Container>
      <Row>
        <SignUpHeader
          title="Let's talk privacy"
          subtitle="Your privacy is our top concern. Always."
          pre={`Hi, ${
            formData.basicsFirstName || formData.theatreName || 'member'
          }!`}
        />
      </Row>
      <Row>
        <SignUpBody lg="8">
          <Paragraph>
            We take privacy seriously (seriously). We will never sell your
            information to a third party. We also know that some of the
            information we're asking for is personal, and for some could be
            sensitive in nature. The reason we’re asking is to create the most
            effective, inclusive, and equitable casting & hiring platform
            possible. While we're collecting information to inform our search
            algorithm, we won't display this information on your profile, or to
            producers and casting directors.
          </Paragraph>
          <Paragraph>
            Tap the green "Accept & Continue" button to agree with our{' '}
            <Link to="/terms-of-service" target="_blank">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" target="_blank">
              Privacy Policy
            </Link>
            .
          </Paragraph>
        </SignUpBody>
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

const Paragraph = styled.p`
  color: ${colors.mainFont};
  font-family: ${fonts.mainFont};
  font-size: 20px;
  letter-spacing: 1px;
`;

export default Privacy;
