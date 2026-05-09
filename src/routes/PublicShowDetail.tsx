import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Col, Image, Row, Tab, Tabs } from 'react-bootstrap';
import { doc, getDoc } from 'firebase/firestore';
import { PageContainer } from '../components/layout';
import { Title } from '../components/layout/Titles';
import { Button } from '../components/shared';
import { useFirebaseContext } from '../context/FirebaseContext';
import { usePagination } from '../context/PaginationContext';
import { useUserContext } from '../context/UserContext';
import { Production } from '../components/Profile/Company/types';
import {
  getTheaterAccountByUid,
  getTheaterByAccountId
} from '../components/Profile/Company/api';
import styled from 'styled-components';
import { breakpoints, colors, fonts } from '../theme/styleVars';
import PublicRoleCard from '../components/PublicShows/PublicRoleCard';
import PublicShowDetailSkeleton from '../components/PublicShows/PublicShowDetailSkeleton';

const PublicShowDetail = () => {
  const { productionId } = useParams<{ productionId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'basic';
  const { firebaseFirestore } = useFirebaseContext();
  const { currentUser } = useUserContext();
  const { getPaginationState } = usePagination();
  const [show, setShow] = useState<Production | null>(null);
  const [theaterName, setTheaterName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Get the saved pagination state
  const savedPaginationState = getPaginationState('/shows');

  useEffect(() => {
    // Flag to track if the component is mounted
    let isMounted = true;

    const fetchShowDetails = async () => {
      if (!productionId) {
        return;
      }

      // Outer try/catch wraps ONLY the production fetch.
      // If this fails, show is set to null and loading stops.
      let productionData: Production | null = null;
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
          productionData = {
            // Required fields with fallbacks
            production_id: rawData.production_id || productionDoc.id,
            production_name: rawData.production_name || 'Untitled Production',
            account_id: rawData.account_id || '',
            location: rawData.location || '',
            theater_name: rawData.theater_name || '',

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
        return;
      }

      if (!productionData || !isMounted) return;

      // Theater-name lookup: best-effort, in its own catch so it never
      // wipes out a successfully-fetched production.
      // Use the denormalized field first; only call the auth-gated query
      // when the user is authenticated and the field is missing (legacy data).
      if (productionData.theater_name) {
        setTheaterName(productionData.theater_name);
      } else if (currentUser && productionData.account_id) {
        try {
          const theaterAccount = await getTheaterAccountByUid(
            firebaseFirestore,
            productionData.account_id
          );

          if (!isMounted) return;

          if (theaterAccount) {
            const theaterProfile = await getTheaterByAccountId(
              firebaseFirestore,
              theaterAccount.id
            );

            if (!isMounted) return;

            const resolvedName =
              (theaterProfile && theaterProfile.theatre_name) ||
              (theaterAccount as any).theater_name ||
              '';
            setTheaterName(resolvedName);
          }
        } catch {
          // Silently ignore — theater name is non-critical display data.
        }
      }
    };

    fetchShowDetails();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [productionId, firebaseFirestore, currentUser]);

  if (loading) {
    return (
      <PageContainer>
        <PublicShowDetailSkeleton />
      </PageContainer>
    );
  }

  if (!show) {
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
          <TheaterNameLink to={`/profile/view/${show.account_id}`}>
            {theaterName}
          </TheaterNameLink>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col lg={12}>
          <ProductionTabs
            activeKey={activeTab}
            className="mb-3"
            id="public-show-detail"
            onSelect={(k) => setSearchParams({ tab: k || 'basic' })}
          >
            <Tab eventKey="basic" title="Basic Info">
              <Row>
                <Col lg={4}>
                  <ShowImage src={show.production_image_url || ''} fluid />
                  <ShowStatus>
                    {show.status || 'Status Not Available'}
                  </ShowStatus>

                  {show.writers && (
                    <div className="mb-[15px]">
                      <InfoLabel>Written by:</InfoLabel>
                      <InfoValue>{show.writers}</InfoValue>
                    </div>
                  )}

                  {show.director && (
                    <div className="mb-[15px]">
                      <InfoLabel>Director:</InfoLabel>
                      <InfoValue>{show.director}</InfoValue>
                    </div>
                  )}

                  {show.location && (
                    <div className="mb-[15px]">
                      <InfoLabel>Location:</InfoLabel>
                      <InfoValue>{show.location}</InfoValue>
                    </div>
                  )}

                  {(show.open_and_close_start || show.open_and_close_end) && (
                    <div className="mb-[15px]">
                      <InfoLabel>Production Dates:</InfoLabel>
                      <InfoValue>
                        {show.open_and_close_start &&
                          new Date(
                            show.open_and_close_start
                          ).toLocaleDateString()}
                        {show.open_and_close_start &&
                          show.open_and_close_end &&
                          ' - '}
                        {show.open_and_close_end &&
                          new Date(
                            show.open_and_close_end
                          ).toLocaleDateString()}
                      </InfoValue>
                    </div>
                  )}

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
                    <div className="mb-[30px]">
                      <SectionTitle>On-Stage Roles</SectionTitle>
                      {onStageRoles.map((role, index) => (
                        <PublicRoleCard
                          key={`${role.role_id || 'unknown'}-onstage-${index}`}
                          role={role}
                        />
                      ))}
                    </div>
                  )}

                  {offStageRoles.length > 0 && (
                    <div className="mb-[30px]">
                      <SectionTitle>Off-Stage Roles</SectionTitle>
                      {offStageRoles.map((role, index) => (
                        <PublicRoleCard
                          key={`${role.role_id || 'unknown'}-offstage-${index}`}
                          role={role}
                        />
                      ))}
                    </div>
                  )}

                  {onStageRoles.length === 0 && offStageRoles.length === 0 && (
                    <NoRoles>
                      No roles have been posted for this production yet.
                    </NoRoles>
                  )}
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="audition" title="Audition Info">
              <Row>
                <Col lg={12}>
                  {(show.audition_start || show.audition_end) && (
                    <div className="mb-[15px]">
                      <InfoLabel>Audition Dates:</InfoLabel>
                      <InfoValue>
                        {show.audition_start &&
                          new Date(show.audition_start).toLocaleDateString()}
                        {show.audition_start && show.audition_end && ' - '}
                        {show.audition_end &&
                          new Date(show.audition_end).toLocaleDateString()}
                      </InfoValue>
                    </div>
                  )}

                  {show.audition_location && (
                    <div className="mb-[15px]">
                      <InfoLabel>Audition Location:</InfoLabel>
                      <InfoValue>{show.audition_location}</InfoValue>
                    </div>
                  )}

                  {show.contact_person_name_audition && (
                    <div className="mb-[15px]">
                      <InfoLabel>Contact Person:</InfoLabel>
                      <InfoValue>{show.contact_person_name_audition}</InfoValue>
                    </div>
                  )}

                  {show.contact_person_email_audition && (
                    <div className="mb-[15px]">
                      <InfoLabel>Contact Email:</InfoLabel>
                      <InfoValue>
                        {show.contact_person_email_audition}
                      </InfoValue>
                    </div>
                  )}

                  {show.materials_to_prepare_audition && (
                    <div className="mb-[15px]">
                      <InfoLabel>Materials to Prepare:</InfoLabel>
                      <InfoValue style={{ whiteSpace: 'pre-line' }}>
                        {show.materials_to_prepare_audition}
                      </InfoValue>
                    </div>
                  )}

                  {show.additional_notes_audition && (
                    <div className="mb-[15px]">
                      <InfoLabel>Additional Notes:</InfoLabel>
                      <InfoValue style={{ whiteSpace: 'pre-line' }}>
                        {show.additional_notes_audition}
                      </InfoValue>
                    </div>
                  )}

                  {!show.audition_start &&
                    !show.audition_end &&
                    !show.audition_location &&
                    !show.contact_person_name_audition &&
                    !show.contact_person_email_audition &&
                    !show.materials_to_prepare_audition &&
                    !show.additional_notes_audition && (
                      <NoRoles>
                        No audition information has been posted for this
                        production yet.
                      </NoRoles>
                    )}
                </Col>
              </Row>
            </Tab>
          </ProductionTabs>
        </Col>
      </Row>
    </PageContainer>
  );
};

const ProductionTabs = styled(Tabs)`
  border-bottom: 1px solid ${colors.paginationGray};
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: ${colors.paginationGray} transparent;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.paginationGray};
    border-radius: 3px;
  }
`;

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

const TheaterNameLink = styled(Link)`
  display: block;
  font-family: ${fonts.montserrat};
  font-weight: 500;
  font-size: 20px;
  color: ${colors.grayishBlue};
  margin-bottom: 20px;
  text-decoration: none;

  &:hover {
    color: ${colors.mint};
    text-decoration: underline;
  }
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
