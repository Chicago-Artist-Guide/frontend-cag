import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useProfileContext } from '../../../context/ProfileContext';
import { Button } from '../../../genericComponents';
import { colors, fonts } from '../../../theme/styleVars';
import PageContainer from '../../layout/PageContainer';
import DetailAdd from '../shared/DetailAdd';
import DetailSection from '../shared/DetailSection';
import CompanyProfileEdit from './Edit';
import { Profile } from './types';

const CompanyProfile: React.FC<{
  previewMode?: boolean;
}> = () => {
  const { profile } = useProfileContext();
  const [isEditing, setIsEditing] = useState(false);
  const profileData = profile?.data as Profile;

  if (isEditing) {
    return <CompanyProfileEdit toggleEdit={setIsEditing} />;
  }

  return (
    <>
      <PageContainer>
        <Row>
          <Col lg={12}>
            <div className="d-flex flex-row justify-content-between">
              <Title>YOUR PROFILE</Title>
              <Button
                onClick={() => setIsEditing(true)}
                text="Edit Profile"
                icon={faPenToSquare}
                type="button"
                variant="secondary"
              />
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={4}>
            <ProfileImage src={profileData?.profile_image_url} fluid />
            <DetailsCard>
              <DetailsColTitle>Basic Group Info</DetailsColTitle>
              <div>
                <DetailsCardItem>
                  Number of Members: {profileData?.number_of_members || '0'}
                </DetailsCardItem>
                <DetailsCardItem>
                  Primary Contact: {profileData?.primary_contact || 'N/A'}
                </DetailsCardItem>
                <DetailsCardItem>
                  Email Address: {profileData?.primary_contact_email || 'N/A'}
                </DetailsCardItem>
              </div>
            </DetailsCard>
          </Col>
          <Col lg={{ span: 7, offset: 1 }}>
            <TheatreName>{profileData?.theatre_name}</TheatreName>

            {profileData?.location && (
              <Location>{profileData.location}</Location>
            )}

            {profileData?.description && <Bio>{profileData.description}</Bio>}

            <DetailSection title="Awards & Recognition">
              <DetailAdd text="Add an award or recognition" />
            </DetailSection>
            <DetailSection title="Active Shows">
              <DetailAdd text="Add a new show" />
            </DetailSection>
            <DetailSection title="Inactive Shows">
              <DetailAdd text="Add a new show" />
            </DetailSection>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

const Title = styled.h1`
  font-family: ${fonts.montserrat};
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 76px;
`;

const TheatreName = styled.h2`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 700;
  font-size: 28px;
  line-height: 36px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${colors.mainFont};
`;

const Location = styled.h5`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
`;

const Bio = styled.div`
  font-family: ${fonts.mainFont};
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.5px;
  color: ${colors.black};
  margin-top: 15px;
`;

const ProfileImage = styled(Image)`
  display: block;
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  background: ${colors.lightGrey};
  min-height: 312px;
  width: 100%;
`;

const DetailsCard = styled.div`
  margin-top: 47px;
  background: ${colors.white};
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  padding: 25px 21px;
`;

const DetailsCardItem = styled.h6`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.07em;
  margin-top: 5px;
`;

const DetailsColTitle = styled.h2`
  font-family: ${fonts.montserrat};
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;

  &::after {
    content: '';
    margin-top: 8px;
    display: block;
    height: 8px;
    background: linear-gradient(
      90deg,
      ${colors.yellow} 0%,
      ${colors.darkGreen} 100%
    );
    border-radius: 4px;
  }
`;

export default CompanyProfile;
