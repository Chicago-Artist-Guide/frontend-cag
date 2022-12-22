import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
import { useProfileContext } from '../../../context/ProfileContext';
import { Button } from '../../../genericComponents';
import { breakpoints, colors, fonts } from '../../../theme/styleVars';
import PageContainer from '../../layout/PageContainer';
import DetailAdd from '../shared/DetailAdd';
import DetailSection from '../shared/DetailSection';
import CompanyAddShow from './Show/AddShow';
import CompanyProfileEdit from './Edit';
import {
  AdditionalPhotos,
  DetailsCard,
  DetailsCardItem,
  DetailsColTitle,
  LeftCol,
  RightCol,
  Title
} from './ProfileStyles';
import { Profile } from './types';
import ActiveShow from './Show/ActiveShow';
import InactiveShow from './Show/InactiveShow';

type Edit = 'profile' | 'add-show' | 'edit-show' | null;

const CompanyProfile: React.FC<{
  previewMode?: boolean;
}> = () => {
  const { profile } = useProfileContext();
  const [editing, setEditing] = useState<Edit>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const profileData = profile?.data as Profile;

  function editShow(id: string) {
    setEditingId(id);
    setEditing('edit-show');
  }

  function toggleEdit() {
    setEditingId(null);
    setEditing(null);
  }

  if (editing !== null) {
    switch (editing) {
      case 'profile':
        return <CompanyProfileEdit toggleEdit={toggleEdit} />;
      case 'add-show':
        return <CompanyAddShow toggleEdit={toggleEdit} />;
      default:
        setEditing(null);
    }
  }

  const images = Array(6).fill(1);

  console.log('profile', profile);

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <div className="d-flex flex-row justify-content-between">
            <Title>YOUR PROFILE</Title>
            <Button
              onClick={() => setEditing('profile')}
              text="Edit Profile"
              icon={faPenToSquare}
              type="button"
              variant="secondary"
            />
          </div>
        </Col>
      </Row>
      <Row>
        <LeftCol lg={4}>
          <ProfileImage src={profileData?.profile_image_url} fluid />
          {profileData?.additional_photos && (
            <AdditionalPhotos className="d-flex flex-wrap justify-content-between">
              {images.map((_, index) => (
                <AdditionalImage
                  key={index}
                  src={profileData?.additional_photos?.[index]}
                  fluid
                />
              ))}
            </AdditionalPhotos>
          )}
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
        </LeftCol>
        <RightCol lg={{ span: 7, offset: 1 }}>
          <TheatreName>{profileData?.theatre_name}</TheatreName>

          {profileData?.location && <Location>{profileData.location}</Location>}

          {profileData?.description && <Bio>{profileData.description}</Bio>}

          <DetailSection title="Awards & Recognition">
            <DetailAdd text="Add an award or recognition" />
          </DetailSection>
          <DetailSection title="Active Shows">
            {profileData?.shows?.map(show => (
              <ActiveShow key={show.show_id} show={show} />
            ))}
            <DetailAdd
              text="Add a new show"
              onClick={() => setEditing('add-show')}
            />
          </DetailSection>
          <DetailSection title="Inactive Shows">
            {profileData?.shows?.map(show => (
              <InactiveShow key={show.show_id} show={show} />
            ))}
            <DetailAdd
              text="Add a new show"
              onClick={() => setEditing('add-show')}
            />
          </DetailSection>
        </RightCol>
      </Row>
    </PageContainer>
  );
};

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
  width: 312px;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: ${breakpoints.lg}) {
    max-width: 332px;
  }
`;

const AdditionalImage = styled(Image)`
  display: block;
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  background: ${colors.lightGrey};
  height: 95px;
  width: 96px;
  margin-bottom: 10px;

  @media (min-width: ${breakpoints.lg}) {
    max-width: 332px;
  }
`;

export default CompanyProfile;
