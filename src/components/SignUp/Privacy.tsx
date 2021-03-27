import React from 'react';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';
import yellow_blob from '../../images/yellow_blob_2.svg';
import Image from 'react-bootstrap/Image';
import { fonts } from '../../theme/styleVars';

const Privacy: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { formData } = props;

  return (
    <Container>
      <Row>
        <Col lg="8">
          <TitleThree>Hi, {formData.basicsFirstName}!</TitleThree>
          <Title>LET'S TALK PRIVACY</Title>
          <Tagline>Your privacy is our top concern. Always.</Tagline>
          <PrivacyPar>
            We take privacy seriously (seriously). We will never share, sell, or
            otherwise distribute your information to a third party. We also know
            that some of the information we’re asking for is personal, and for
            some could be sensitive in nature. The reason we’re asking is to
            create the most effective, inclusive, and equitable casting & hiring
            platform possible. If you see <span>“Private”</span> next to a
            field, that’s because even though we’re collecting the information
            to inform our search algorithm, we won’t display this information on
            your profile, or to producers and casting directors. If you’d like
            to learn more about the measures we take to secure your data,{' '}
            <Link to="/faq">click here</Link> [link to FAQs].
          </PrivacyPar>
          <Link to="/terms-of-service">
            <Caption className="caption">
              View our full terms and privacy policy
            </Caption>
          </Link>
          <br></br>
          <PrivacyPar>
            Tap the button below to agree with our terms and privacy policy.
          </PrivacyPar>
        </Col>
        <ImageCol lg="4">
          <Image alt="" src={yellow_blob} />
        </ImageCol>
      </Row>
    </Container>
  );
};

const Tagline = (props: any) => {
  const { children, ...rest } = props;
  return <TaglineH2 {...rest}>{children}</TaglineH2>;
};

const TitleThree = (props: any) => {
  const { children, ...rest } = props;
  return <TitleH3 {...rest}>{children}</TitleH3>;
};

const ImageCol = styled(Col)`
  max-width: 100%;
  max-height: 100%;
  display: flex;
`;

const PrivacyPar = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 20px;
  letter-spacing: 0px;
  color: #0c2028;
  margin-top: 17px;
  span {
    font-size: 16px;
    color: #82b29a;
    font-weight: bold;
  }
`;

const Caption = styled.em`
  font-family: ${fonts.lora};
  font-size: 14px;
  margin-top: 26px;
  margin-bottom: 18px;
  font-color: #4DS0S5;
`;

const Title = styled.h1`
  font-family: ${fonts.montserrat};
  font-size: 48px;
  font-weight: bold;
`;

const TitleH2 = styled.h2`
  font-family: ${fonts.lora};
  font-size: 1.75rem;
  font-weight: 400;
`;

const TaglineH2 = styled(TitleH2 as any)`
  margin-bottom: 17px;
  font-family: ${fonts.lora};
  font-size: 28px;
  letter-spacing: 0em;
`;

const TitleH3 = styled.h3`
  font-family: ${fonts.montserrat}
  font-size: 28px;
  font-weight: bold;
  color: #0c2028;
  text-transform: uppercase;
`;

export default Privacy;
