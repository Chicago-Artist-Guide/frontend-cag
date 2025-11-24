import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
import { Button } from '../../../components/shared';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useUserContext } from '../../../context/UserContext';
import { breakpoints, colors, fonts } from '../../../theme/styleVars';
import PageContainer from '../../layout/PageContainer';
import DetailAdd from '../shared/DetailAdd';
import DetailSection from '../shared/DetailSection';
import CompanyProfileEdit from './Edit';
import ActiveProduction from './Production/ActiveProduction';
import AddProduction from './Production/AddProduction';
import InactiveProduction from './Production/InactiveProduction';
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

type Edit = 'profile' | 'add-production' | null;

const MAX_ADDITIONAL_PHOTOS = 6;

const CompanyProfile: React.FC<{
  previewMode?: boolean;
}> = () => {
  const { firebaseFirestore: db } = useFirebaseContext();
  const {
    profile,
    account: {
      data: { uid }
    }
  } = useUserContext();
  const [editing, setEditing] = useState<Edit>(null);
  const [productions, setProductions] = useState<{
    active: Production[];
    inactive: Production[];
  }>();
  const profileData = profile?.data as Profile;

  const getProductions = useCallback(async () => {
    if (!uid || !db) {
      return;
    }

    try {
      const q = query(
        collection(db, 'productions'),
        where('account_id', '==', uid)
      );
      const querySnapshot = await getDocs(q);
      const productionsByStatus = querySnapshot.docs
        .map((docSnap) => {
          const data = docSnap.data() as Production;

          return {
            ...data,
            production_id: data.production_id || docSnap.id
          };
        })
        .reduce(
          (acc, cur) => {
            if (cur.status === 'Show Complete') {
              acc.inactive.push(cur);
            } else {
              acc.active.push(cur);
            }
            return acc;
          },
          { active: [] as Production[], inactive: [] as Production[] }
        );

      setProductions(productionsByStatus);
    } catch (error) {
      console.error('Error fetching productions:', error);
    }
  }, [uid, db]);

  useEffect(() => {
    getProductions();
  }, [getProductions]);

  const toggleEdit = async () => {
    await getProductions();
    setEditing(null);
  };

  if (editing === 'profile') {
    return <CompanyProfileEdit toggleEdit={toggleEdit} />;
  }

  if (editing === 'add-production') {
    return <AddProduction toggleEdit={toggleEdit} />;
  }

  const awards = profileData?.awards || [];

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <Title>YOUR PROFILE</Title>
        </Col>
      </Row>
      <Row>
        <LeftCol lg={4}>
          <ProfileImage src={profileData?.profile_image_url} fluid />
          <EditProfileButtonWrapper>
            <Button
              onClick={() => setEditing('profile')}
              text="Edit Profile"
              icon={faPenToSquare}
              type="button"
              variant="secondary"
            />
          </EditProfileButtonWrapper>
          {profileData?.additional_photos &&
            Object.keys(profileData.additional_photos).length > 0 && (
              <AdditionalPhotos className="d-flex justify-content-between flex-wrap">
                {Array.from({ length: MAX_ADDITIONAL_PHOTOS }, (_, index) => {
                  const photoUrl = profileData.additional_photos?.[index];
                  if (!photoUrl) return null;
                  return (
                    <AdditionalImage
                      key={index}
                      src={photoUrl}
                      fluid
                      alt={`Additional photo ${index + 1}`}
                    />
                  );
                })}
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
          <DetailsCard>
            <DetailsColTitle>
              <div>Menu</div>
            </DetailsColTitle>
            <MenuLinkContainer>
              <MenuLink to="/profile/messages">Messages</MenuLink>
            </MenuLinkContainer>
          </DetailsCard>
        </LeftCol>
        <RightCol lg={{ span: 7, offset: 1 }}>
          <TheatreInfoCard>
            {profileData?.theatre_name && (
              <TheatreName>{profileData.theatre_name}</TheatreName>
            )}

            {profileData?.location && (
              <Location>{profileData.location}</Location>
            )}

            {profileData?.description && <Bio>{profileData.description}</Bio>}
          </TheatreInfoCard>

          <DetailSection title="Awards & Recognition">
            <AwardsGrid>
              {awards.map((award, index) => (
                <div className="award-card" key={award.award_id}>
                  <AwardTitle>Award #{index + 1}</AwardTitle>
                  <div className="d-flex flex-column ml-4">
                    <AwardField>
                      <AwardLabel>Award</AwardLabel>
                      <span>{award.award_name}</span>
                    </AwardField>
                    <AwardField>
                      <AwardLabel>Awarded By:</AwardLabel>
                      <span>{award.awarded_by}</span>
                    </AwardField>
                    <AwardField>
                      <AwardLabel>Year:</AwardLabel>
                      <span>{award.award_year}</span>
                    </AwardField>
                    {award.show_title && (
                      <AwardField>
                        <AwardLabel>Show Title:</AwardLabel>
                        <span>{award.show_title}</span>
                      </AwardField>
                    )}
                    {award.website_links && (
                      <div>
                        <AwardLabel>Relevant Links:</AwardLabel>
                        <div>
                          {award.website_links.map((link, linkIndex) => (
                            <a
                              key={linkIndex}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </AwardsGrid>
            <div className="mt-3">
              <DetailAdd
                text="Add an award or recognition"
                onClick={() => setEditing('profile')}
              />
            </div>
          </DetailSection>
          <DetailSection title="Active Shows">
            {productions?.active?.map((show) => (
              <ActiveProduction key={show.production_id} show={show} />
            ))}
            <DetailAdd
              text="Add a new show"
              onClick={() => setEditing('add-production')}
            />
          </DetailSection>
          {!!productions?.inactive?.length && (
            <DetailSection title="Inactive Shows">
              {productions?.inactive?.map((show) => (
                <InactiveProduction key={show.production_id} show={show} />
              ))}
            </DetailSection>
          )}
        </RightCol>
      </Row>
    </PageContainer>
  );
};

const AwardTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${colors.mainFont};

  @media (max-width: ${breakpoints.md}) {
    font-size: 20px;
  }
`;

const EditProfileButtonWrapper = styled.div`
  margin-top: 20px;
  width: 100%;

  @media (max-width: ${breakpoints.md}) {
    button {
      width: 100%;
      min-height: 44px;
    }
  }

  @media (min-width: ${breakpoints.lg}) {
    button {
      width: auto;
    }
  }
`;

const TheatreInfoCard = styled.div`
  background: ${colors.white};
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  padding: 30px 25px;
  margin-bottom: 20px;

  @media (max-width: ${breakpoints.md}) {
    padding: 24px 20px;
    margin-bottom: 16px;
  }

  @media (max-width: ${breakpoints.sm}) {
    padding: 20px 16px;
  }
`;

const MenuLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MenuLink = styled(Link)`
  font-family: ${fonts.montserrat};
  font-size: 16px;
  color: ${colors.mainFont};
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: ${colors.primary};
    text-decoration: underline;
  }
`;

const AwardLabel = styled.span`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
`;

const AwardField = styled.div`
  display: flex;
  margin-bottom: 6px;
  align-items: flex-start;

  ${AwardLabel} {
    min-width: 110px;
    font-weight: 700;
    margin-right: 8px;
    flex-shrink: 0;

    @media (max-width: ${breakpoints.sm}) {
      min-width: 90px;
      font-size: 14px;
    }
  }

  span {
    flex: 1;
    word-break: break-word;
  }

  @media (max-width: ${breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;

    ${AwardLabel} {
      margin-bottom: 4px;
      margin-right: 0;
    }
  }
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
  margin: 0 0 16px 0;

  @media (max-width: ${breakpoints.md}) {
    font-size: 24px;
    line-height: 32px;
    margin-bottom: 14px;
  }
`;

const Location = styled.h5`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  margin: 0 0 20px 0;

  @media (max-width: ${breakpoints.md}) {
    font-size: 16px;
    line-height: 22px;
    margin-bottom: 18px;
  }
`;

const Bio = styled.div`
  font-family: ${fonts.mainFont};
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 28px;
  letter-spacing: 0.5px;
  color: ${colors.black};
  margin: 0;
  word-wrap: break-word;

  @media (max-width: ${breakpoints.md}) {
    font-size: 14px;
    line-height: 24px;
  }
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
  max-width: 100%;

  @media (max-width: ${breakpoints.md}) {
    width: 100%;
    min-height: auto;
  }

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

const AwardsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 16px;

  .award-card {
    flex: 1 1 calc(50% - 12px);
    min-width: 300px;
    box-sizing: border-box;

    @media (max-width: ${breakpoints.md}) {
      flex: 1 1 100%;
      min-width: 0;
    }
  }
`;

export default CompanyProfile;
