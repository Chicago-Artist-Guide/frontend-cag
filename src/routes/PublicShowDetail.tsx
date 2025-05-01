import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Col, Row, Image } from 'react-bootstrap';
import { doc, getDoc } from 'firebase/firestore';
import { PageContainer } from '../components/layout';
import { Title } from '../components/layout/Titles';
import { Button } from '../components/shared';
import { useFirebaseContext } from '../context/FirebaseContext';
import { usePagination } from '../context/PaginationContext';
import { useUserContext } from '../context/UserContext';
import { Production, Role } from '../components/Profile/Company/types';
import styled from 'styled-components';
import { colors, fonts } from '../theme/styleVars';
import PublicRoleCard from '../components/PublicShows/PublicRoleCard';
import PublicShowDetailSkeleton from '../components/PublicShows/PublicShowDetailSkeleton';
import PublicShowInterestForm from '../components/PublicShows/PublicShowInterestForm';

const PublicShowDetail = () => {
  const { productionId } = useParams<{ productionId: string }>();
  const { firebaseFirestore } = useFirebaseContext();
  const { currentUser } = useUserContext();
  const { getPaginationState } = usePagination();
  const [show, setShow] = useState<Production | null>(null);
  const [theaterName, setTheaterName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Get the saved pagination state
  const savedPaginationState = getPaginationState('/shows');

  useEffect(() => {
    // Flag to track if the component is mounted
    let isMounted = true;

    const fetchShowDetails = async () => {
      if (!productionId) {
        return;
      }

      try {
        const productionRef = doc(
          firebaseFirestore,
          'productions',
          productionId
        );
        const productionDoc = await getDoc(productionRef);

        if (!isMounted) return;

        if (productionDoc.exists()) {
          // Get the raw data
          const rawData = productionDoc.data();

          // Create a valid Production object with required fields
          const productionData: Production = {
            // Required fields with fallbacks
            production_id: rawData.production_id || productionDoc.id,
            production_name: rawData.production_name || 'Untitled Production',
            account_id: rawData.account_id || '',
            location: rawData.location || '',

            // Optional fields
            production_image_url: rawData.production_image_url,
            type: rawData.type,
            type_other: rawData.type_other,
            status: rawData.status,
            description: rawData.description,
            director: rawData.director,
            musical_director: rawData.musical_director,
            casting_director: rawData.casting_director,
            casting_director_email: rawData.casting_director_email,
            equity: rawData.equity,
            audition_start: rawData.audition_start,
            audition_end: rawData.audition_end,
            callback_start: rawData.callback_start,
            callback_end: rawData.callback_end,
            rehearsal_start: rawData.rehearsal_start,
            rehearsal_end: rawData.rehearsal_end,
            tech_week_start: rawData.tech_week_start,
            tech_week_end: rawData.tech_week_end,
            open_and_close_start: rawData.open_and_close_start,
            open_and_close_end: rawData.open_and_close_end,
            writers: rawData.writers,
            roles: Array.isArray(rawData.roles) ? rawData.roles : [],
            audition_location: rawData.audition_location,
            contact_person_name_offstage: rawData.contact_person_name_offstage,
            contact_person_email_offstage:
              rawData.contact_person_email_offstage,
            additional_notes_offstage: rawData.additional_notes_offstage,
            contact_person_name_audition: rawData.contact_person_name_audition,
            contact_person_email_audition:
              rawData.contact_person_email_audition,
            materials_to_prepare_audition:
              rawData.materials_to_prepare_audition,
            additional_notes_audition: rawData.additional_notes_audition
          };

          // Set the show data
          setShow(productionData);

          // Fetch theater name
          if (productionData.account_id) {
            const accountRef = doc(
              firebaseFirestore,
              'accounts',
              productionData.account_id
            );
            const accountDoc = await getDoc(accountRef);

            if (!isMounted) return;

            if (accountDoc.exists()) {
              const accountData = accountDoc.data();

              // Check if profile_id exists before trying to access it
              if (accountData && accountData.profile_id) {
                const profileRef = doc(
                  firebaseFirestore,
                  'profiles',
                  accountData.profile_id
                );
                const profileDoc = await getDoc(profileRef);

                if (!isMounted) return;

                if (profileDoc.exists()) {
                  const profileData = profileDoc.data();
                  if (profileData && profileData.theatre_name) {
                    setTheaterName(profileData.theatre_name);
                  } else {
                    setTheaterName('Unknown Theater');
                  }
                } else {
                  setTheaterName('Unknown Theater');
                }
              } else {
                setTheaterName('Unknown Theater');
              }
            } else {
              setTheaterName('Unknown Theater');
            }
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching show details:', error);
          setShow(null);
          setLoading(false);
        }
      }
    };

    fetchShowDetails();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [productionId, firebaseFirestore]);

  const handleShowInterestClick = (role: Role | null) => {
    setSelectedRole(role);
    setShowInterestForm(true);
  };

  const handleCloseForm = () => {
    setShowInterestForm(false);
    setSelectedRole(null);
  };

  if (loading) {
    return (
      <PageContainer>
        <PublicShowDetailSkeleton />
      </PageContainer>
    );
  }

  if (!show) {
    // Keep the console logs for debugging
    console.log(
      'Show is null or undefined, displaying "Show not found" message'
    );
    console.log('Current productionId:', productionId);

    return (
      <PageContainer>
        <BackLink to="/shows">
          ← Back to shows (page {savedPaginationState.currentPage || 1})
        </BackLink>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <h2>Show Not Found</h2>
          <p>
            We couldn't find the show you're looking for. It may have been
            removed or is no longer active.
          </p>
          <p>
            <Link to="/shows">
              <ShowButton
                text="Browse All Shows"
                type="button"
                variant="primary"
              />
            </Link>
          </p>
        </div>
      </PageContainer>
    );
  }

  // Ensure show has roles property and it's an array
  const roles = Array.isArray(show.roles) ? show.roles : [];

  // Filter roles by type
  const onStageRoles =
    roles.filter((role) => role && role.type === 'On-Stage') || [];
  const offStageRoles =
    roles.filter((role) => role && role.type === 'Off-Stage') || [];

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <BackLink to="/shows">
            ← Back to shows (page {savedPaginationState.currentPage || 1})
          </BackLink>
          <Title>{show.production_name}</Title>
          <TheaterName>{theaterName}</TheaterName>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col lg={4}>
          <ShowImage src={show.production_image_url || ''} fluid />
          <ShowStatus>{show.status || 'Status Not Available'}</ShowStatus>

          {show.writers && (
            <InfoSection>
              <InfoLabel>Written by:</InfoLabel>
              <InfoValue>{show.writers}</InfoValue>
            </InfoSection>
          )}

          {show.director && (
            <InfoSection>
              <InfoLabel>Director:</InfoLabel>
              <InfoValue>{show.director}</InfoValue>
            </InfoSection>
          )}

          {show.location && (
            <InfoSection>
              <InfoLabel>Location:</InfoLabel>
              <InfoValue>{show.location}</InfoValue>
            </InfoSection>
          )}

          {show.open_and_close_start && show.open_and_close_end && (
            <InfoSection>
              <InfoLabel>Dates:</InfoLabel>
              <InfoValue>
                {new Date(show.open_and_close_start).toLocaleDateString()} -
                {new Date(show.open_and_close_end).toLocaleDateString()}
              </InfoValue>
            </InfoSection>
          )}

          <ShowButton
            onClick={() => handleShowInterestClick(null)}
            text="Express Interest in this Show"
            type="button"
            variant="primary"
          />

          {!currentUser && (
            <SignUpPrompt>
              <Link to="/sign-up">Sign up</Link> or{' '}
              <Link to="/login">log in</Link> to apply directly to roles
            </SignUpPrompt>
          )}
        </Col>

        <Col lg={8}>
          <ShowDescription>
            {show.description || 'No description available.'}
          </ShowDescription>

          {onStageRoles.length > 0 && (
            <RolesSection>
              <SectionTitle>On-Stage Roles</SectionTitle>
              {onStageRoles.map((role, index) => (
                <PublicRoleCard
                  key={`${role.role_id || 'unknown'}-onstage-${index}`}
                  role={role}
                  onShowInterest={() => handleShowInterestClick(role)}
                  isLoggedIn={!!currentUser}
                />
              ))}
            </RolesSection>
          )}

          {offStageRoles.length > 0 && (
            <RolesSection>
              <SectionTitle>Off-Stage Roles</SectionTitle>
              {offStageRoles.map((role, index) => (
                <PublicRoleCard
                  key={`${role.role_id || 'unknown'}-offstage-${index}`}
                  role={role}
                  onShowInterest={() => handleShowInterestClick(role)}
                  isLoggedIn={!!currentUser}
                />
              ))}
            </RolesSection>
          )}

          {onStageRoles.length === 0 && offStageRoles.length === 0 && (
            <NoRoles>
              No roles have been posted for this production yet.
            </NoRoles>
          )}
        </Col>
      </Row>

      {showInterestForm && (
        <PublicShowInterestForm
          show={show}
          role={selectedRole}
          theaterName={theaterName}
          onClose={handleCloseForm}
        />
      )}
    </PageContainer>
  );
};

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 20px;
  color: ${colors.grayishBlue};
  text-decoration: none;
  font-family: ${fonts.montserrat};

  &:hover {
    color: ${colors.mint};
    text-decoration: underline;
  }
`;

const TheaterName = styled.h2`
  font-family: ${fonts.montserrat};
  font-weight: 500;
  font-size: 20px;
  color: ${colors.grayishBlue};
  margin-bottom: 20px;
`;

const ShowImage = styled(Image)`
  width: 100%;
  border-radius: 8px;
  margin-bottom: 15px;
`;

const ShowStatus = styled.div`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 16px;
  color: ${colors.mint};
  margin-bottom: 20px;
`;

const InfoSection = styled.div`
  margin-bottom: 15px;
`;

const InfoLabel = styled.div`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 14px;
  color: ${colors.grayishBlue};
`;

const InfoValue = styled.div`
  font-family: ${fonts.montserrat};
  font-size: 16px;
`;

const ShowButton = styled(Button)`
  width: 100%;
  margin-top: 20px;
  margin-bottom: 15px;
`;

const SignUpPrompt = styled.p`
  font-family: ${fonts.montserrat};
  font-size: 14px;
  color: ${colors.grayishBlue};
  text-align: center;

  a {
    color: ${colors.mint};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ShowDescription = styled.div`
  font-family: ${fonts.montserrat};
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
  white-space: pre-line;
`;

const RolesSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${colors.lightGrey};
`;

const NoRoles = styled.p`
  font-family: ${fonts.montserrat};
  font-size: 16px;
  color: ${colors.grayishBlue};
  font-style: italic;
`;

export default PublicShowDetail;
