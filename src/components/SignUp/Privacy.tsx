import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import yellow_blob from '../../images/yellow_blob_2.svg';
import { colors, fonts } from '../../theme/styleVars';
import SignUpBody from './shared/Body';
import SignUpHeader from './shared/Header';

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
          subtitle="Privacy for all of our users is our top concern. Always."
          pre={`Hi, ${
            formData.basicsFirstName || formData.theatreName || 'member'
          }!`}
        />
      </Row>
      <Row>
        <SignUpBody lg="8">
          <PrivacyPar>
            We take privacy seriously (seriously). That means that we expect you
            to never share, sell, or otherwise distribute any information on
            this site to a third party. Doing so will be grounds for the
            immediate removal of your organization's account.
          </PrivacyPar>
          <PrivacyPar>
            Some of the information you'll see from individual users is
            personal, and for some could be sensitive in nature. The reason we
            allow access to this information is for the purpose of creating the
            most effective, inclusive, and equitable casting &amp; hiring
            platform possible. You are expected to use our platform for this
            purpose in filling your positions.
          </PrivacyPar>
          <PrivacyPar>
            While we may use aggregated data for reporting purposes, we will
            never share your group's individual data. If you'd like to learn
            more about the measures we take to secure user data,{' '}
            <Link to="/faq" target="_blank">
              click here
            </Link>
            .
          </PrivacyPar>
          <TermsPrivacyLink to="/terms-of-service" target="_blank">
            View our full terms and privacy policy
          </TermsPrivacyLink>
          <PrivacyPar>
            Tap the green "Accept &amp; Continue" button to agree with our terms
            and privacy policy.
          </PrivacyPar>
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

const PrivacyPar = styled.p`
  color: ${colors.mainFont};
  font-family: ${fonts.mainFont};
  font-size: 20px;
  letter-spacing: 0px;
`;

const TermsPrivacyLink = styled(Link)`
  color: ${colors.veryDarkGrayBlue};
  font-family: ${fonts.lora};
  font-size: 14px;
  margin-bottom: 18px;
  margin-top: 26px;
`;

export default Privacy;
