import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import { Tagline, TitleThree } from '../layout/Titles';
import { colors, fonts } from '../../theme/styleVars';
import yellow_blob from '../../images/yellow_blob_2.svg';
import PrivateLabel from '../../genericComponents/PrivateLabel';

const Privacy: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { formData } = props;

  return (
    <Container>
      <Row>
        <Col lg="8">
          <TitleThree>Hi, {formData.basicsFirstName || 'member'}!</TitleThree>
          <Title>LET'S TALK PRIVACY</Title>
          <Tagline>Your privacy is our top concern. Always.</Tagline>
          <PrivacyPar>
            We take privacy seriously (seriously). We will never share, sell, or
            otherwise distribute your information to a third party. We also know
            that some of the information we're asking for is personal, and for
            some could be sensitive in nature. The reason we’re asking is to
            create the most effective, inclusive, and equitable casting & hiring
            platform possible. If you see <PrivateLabel /> next to a field,
            that's because even though we're collecting the information to
            inform our search algorithm, we won't display this information on
            your profile, or to producers and casting directors. If you'd like
            to learn more about the measures we take to secure your data,{' '}
            <Link to="/faq">click here</Link>.
          </PrivacyPar>
          <TermsPrivacyLink to="/terms-of-service">
            View our full terms and privacy policy
          </TermsPrivacyLink>
          <PrivacyPar>
          Tap the green “Accept & Continue” button to agree with our terms and privacy policy.
          </PrivacyPar>
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
