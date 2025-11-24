import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import CompanyProfile from '../components/Profile/Company';
import IndividualProfile from '../components/Profile/Individual';
import PageContainer from '../components/layout/PageContainer';
import { useUserContext } from '../context/UserContext';
import { colors, fonts } from '../theme/styleVars';

const Profile: React.FC<{
  previewMode?: boolean;
}> = ({ previewMode = false }) => {
  const navigate = useNavigate();
  const auth = getAuth();
  const {
    account: { ref: accountRef, data: account },
    setAccountData,
    profile: { ref: profileRef },
    setProfileData
  } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getProfileData = useCallback(async () => {
    if (!profileRef || !accountRef) {
      setLoading(false);
      return;
    }

    try {
      const [profileData, accountData] = await Promise.all([
        getDoc(profileRef),
        getDoc(accountRef)
      ]);

      setProfileData(profileData.data());
      setAccountData(accountData.data());
      setError(null);
    } catch (err) {
      console.error('Error loading profile data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [profileRef, accountRef, setProfileData, setAccountData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      }
    });

    getProfileData();

    return () => unsubscribe();
  }, [auth, navigate, getProfileData]);

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingText>Loading profile...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={getProfileData}>Retry</RetryButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  if (account?.type === 'company') {
    return <CompanyProfile previewMode={previewMode} />;
  }

  if (account?.type === 'individual') {
    return <IndividualProfile previewMode={previewMode} />;
  }

  return (
    <PageContainer>
      <NoProfileContainer>
        <NoProfileText>No profile found</NoProfileText>
        <NoProfileSubtext>
          Please contact support if you believe this is an error.
        </NoProfileSubtext>
      </NoProfileContainer>
    </PageContainer>
  );
};

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const LoadingText = styled.p`
  font-family: ${fonts.montserrat};
  font-size: 18px;
  color: ${colors.grayishBlue};
  margin: 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
`;

const ErrorText = styled.p`
  font-family: ${fonts.montserrat};
  font-size: 16px;
  color: ${colors.salmon};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const RetryButton = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 20px;
  padding: 12px 24px;
  font-family: ${fonts.montserrat};
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: background 0.2s;

  &:hover {
    background: ${colors.darkPrimary};
  }
`;

const NoProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
`;

const NoProfileText = styled.h2`
  font-family: ${fonts.montserrat};
  font-size: 24px;
  color: ${colors.mainFont};
  margin-bottom: 0.5rem;
`;

const NoProfileSubtext = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 16px;
  color: ${colors.grayishBlue};
  text-align: center;
  margin: 0;
`;

export default Profile;
