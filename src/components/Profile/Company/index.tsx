import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import React, { useEffect, useState } from 'react';
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
import AddProduction from './Production/AddProduction';
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
import { Production, Profile } from './types';
import ActiveProduction from './Production/ActiveProduction';
import InactiveProduction from './Production/InactiveProduction';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useFirebaseContext } from '../../../context/FirebaseContext';

type Edit = 'profile' | 'add-production' | null;

const images = Array(6).fill(1);

const CompanyProfile: React.FC<{
  previewMode?: boolean;
}> = () => {
  const { firebaseFirestore: db } = useFirebaseContext();
  const {
    profile,
    account: {
      data: { uid }
    }
  } = useProfileContext();
  const [editing, setEditing] = useState<Edit>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const profileData = profile?.data as Profile;

  useEffect(() => {
    getProductions();
  }, []);

  const getProductions = async () => {
    const q = query(
      collection(db, 'productions'),
      where('account_id', '==', uid)
    );
    const querySnapshot = await getDocs(q);
    setProductions(querySnapshot.docs.map(doc => doc.data()) as Production[]);
  };

  const toggleEdit = async () => {
    await getProductions();
    setEditing(null);
  };

  if (editing !== null) {
    switch (editing) {
      case 'profile':
        return <CompanyProfileEdit toggleEdit={toggleEdit} />;
      case 'add-production':
        return <AddProduction toggleEdit={toggleEdit} />;
      default:
        setEditing(null);
    }
  }

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
            {productions?.map(show => (
              <ActiveProduction key={show.production_id} show={show} />
            ))}
            <DetailAdd
              text="Add a new show"
              onClick={() => setEditing('add-production')}
            />
          </DetailSection>
          <DetailSection title="Inactive Shows">
            {productions?.map(show => (
              <InactiveProduction key={show.production_id} show={show} />
            ))}
            <DetailAdd
              text="Add a new show"
              onClick={() => setEditing('add-production')}
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
