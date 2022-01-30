import React from 'react';
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import Image from 'react-bootstrap/Image';
import { Tagline } from '../components/layout/Titles';
import styled from 'styled-components';
import { colors, fonts } from '../theme/styleVars';
import yellow_blob from '../images/yellow_blob_2.svg';

const Profile: React.FC<{
  previewMode?: boolean;
}> = ({ previewMode = false }) => {
  return (
    <PageContainer>
      <Row>
        <Col lg={8}>
          <Title>SIGN UP COMPLETED</Title>
          <Tagline>Thanks for signing up!</Tagline>
          {previewMode && (
            <>
              <Preview>
                We’ll notify you via email once we’re ready to launch our beta
                version of the platform, at which time you’ll be able to add
                more detail to your profile, like your bio, education and
                training, as well as past credits. Stay tuned!
              </Preview>
              <Preview>
                <Link to="/home"> Click to return home</Link>.
              </Preview>
            </>
          )}
        </Col>
        <ImageCol lg="4">
          <Image alt="" src={yellow_blob} />
        </ImageCol>
      </Row>
    </PageContainer>
  );
};

const ImageCol = styled(Col)`
  display: flex;
  max-height: 100%;
  max-width: 100%;
`;

const Preview = styled.p`
  color: ${colors.mainFont};
  font-family: ${fonts.mainFont};
  font-size: 20px;
  letter-spacing: 0px;
  margin-top: 17px;
`;

const Title = styled.h1`
  font-family: ${fonts.montserrat};
  font-size: 48px;
  font-weight: bold;
`;

export default Profile;
