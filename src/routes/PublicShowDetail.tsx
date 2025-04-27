import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Col, Row, Image } from 'react-bootstrap';
import { doc, getDoc } from 'firebase/firestore';
import { PageContainer } from '../components/layout';
import { Title } from '../components/layout/Titles';
import { Button } from '../components/shared';
import { useFirebaseContext } from '../context/FirebaseContext';
import { useUserContext } from '../context/UserContext';
import { Production, Role } from '../components/Profile/Company/types';
import styled from 'styled-components';
import { colors, fonts } from '../theme/styleVars';
import PublicRoleCard from '../components/PublicShows/PublicRoleCard';
import PublicShowInterestForm from '../components/PublicShows/PublicShowInterestForm';

const PublicShowDetail = () => {
  const { productionId } = useParams<{ productionId: string }>();
  const { firebaseFirestore } = useFirebaseContext();
  const { currentUser } = useUserContext();
  const [show, setShow] = useState<Production | null>(null);
  const [theaterName, setTheaterName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    const fetchShowDetails = async () => {
      if (!productionId) return;

      try {
        const productionRef = doc(
          firebaseFirestore,
          'productions',
          productionId
        );
        const productionDoc = await getDoc(productionRef);

        if (productionDoc.exists()) {
          const productionData = productionDoc.data() as Production;
          setShow(productionData);

          // Fetch theater name
          if (productionData.account_id) {
            const accountRef = doc(
              firebaseFirestore,
              'accounts',
              productionData.account_id
            );
            const accountDoc = await getDoc(accountRef);

            if (accountDoc.exists()) {
              const accountData = accountDoc.data();
              const profileRef = doc(
                firebaseFirestore,
                'profiles',
                accountData.profile_id
              );
              const profileDoc = await getDoc(profileRef);

              if (profileDoc.exists()) {
                const profileData = profileDoc.data();
                setTheaterName(profileData.theatre_name || 'Unknown Theater');
              }
            }
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching show details:', error);
        setLoading(false);
      }
    };

    fetchShowDetails();
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
        <p>Loading show details...</p>
      </PageContainer>
    );
  }

  if (!show) {
    return (
      <PageContainer>
        <p>
          Show not found. <Link to="/shows">View all shows</Link>
        </p>
      </PageContainer>
    );
  }

  // Filter roles by type
  const onStageRoles =
    show.roles?.filter((role) => role.type === 'On-Stage') || [];
  const offStageRoles =
    show.roles?.filter((role) => role.type === 'Off-Stage') || [];

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <BackLink to="/shows">← Back to all shows</BackLink>
          <Title>{show.production_name}</Title>
          <TheaterName>{theaterName}</TheaterName>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col lg={4}>
          <ShowImage src={show.production_image_url} fluid />
          <ShowStatus>{show.status}</ShowStatus>

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
          <ShowDescription>{show.description}</ShowDescription>

          {onStageRoles.length > 0 && (
            <RolesSection>
              <SectionTitle>On-Stage Roles</SectionTitle>
              {onStageRoles.map((role) => (
                <PublicRoleCard
                  key={role.role_id}
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
              {offStageRoles.map((role) => (
                <PublicRoleCard
                  key={role.role_id}
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
