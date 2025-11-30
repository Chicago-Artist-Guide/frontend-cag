import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import CompanyProfile from '../components/Profile/Company';
import IndividualProfile from '../components/Profile/Individual';
import PageContainer from '../components/layout/PageContainer';
import { useUserContext } from '../context/UserContext';
import { useFirebaseContext } from '../context/FirebaseContext';
import {
  getProfileWithUid,
  getAccountWithAccountId
} from '../components/Profile/shared/api';
import { colors, fonts } from '../theme/styleVars';

const Profile: React.FC<{
  previewMode?: boolean;
}> = ({ previewMode = false }) => {
  const navigate = useNavigate();
  const { accountId } = useParams<{ accountId?: string }>();
  const auth = getAuth();
  const { firebaseFirestore } = useFirebaseContext();
  const {
    account: { ref: accountRef, data: account },
    setAccountData,
    profile: { ref: profileRef },
    setProfileData
  } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingOtherProfile, setViewingOtherProfile] = useState(false);
  // Separate state for viewing other user's profile to avoid polluting context
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const [viewedAccount, setViewedAccount] = useState<any>(null);
  // Refs to store original user data when viewing another profile
  const originalAccountRef = useRef<any>(null);
  const originalProfileRef = useRef<any>(null);

  const getProfileData = useCallback(async () => {
    // If viewing another user's profile
    if (accountId && accountId !== account?.id) {
      try {
        setViewingOtherProfile(true);
        const [profileData, accountData] = await Promise.all([
          getProfileWithUid(firebaseFirestore, accountId),
          getAccountWithAccountId(firebaseFirestore, accountId)
        ]);

        if (profileData && accountData) {
          // Store in separate state to avoid polluting user context
          setViewedProfile(profileData);
          setViewedAccount(accountData);
          setError(null);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Otherwise, load current user's profile
    if (!profileRef || !accountRef) {
      setLoading(false);
      return;
    }

    try {
      setViewingOtherProfile(false);
      setViewedProfile(null);
      setViewedAccount(null);
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
  }, [
    accountId,
    account?.id,
    profileRef,
    accountRef,
    setProfileData,
    setAccountData,
    firebaseFirestore
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && !accountId) {
        navigate('/login');
      }
    });

    getProfileData();

    return () => unsubscribe();
  }, [auth, navigate, getProfileData, accountId]);

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

  // Handle viewing other profiles - temporarily set context and restore when done
  useEffect(() => {
    if (viewingOtherProfile && viewedAccount && viewedProfile) {
      // Save original data if not already saved
      if (!originalAccountRef.current) {
        originalAccountRef.current = account;
        // Don't save profile ref as it's a DocumentReference
      }

      // Temporarily set viewed profile in context
      setAccountData(viewedAccount);
      setProfileData(viewedProfile);
    }

    // Restore original data when no longer viewing other profile
    return () => {
      if (originalAccountRef.current && !accountId) {
        setAccountData(originalAccountRef.current);
        originalAccountRef.current = null;
      }
    };
  }, [
    viewingOtherProfile,
    viewedAccount,
    viewedProfile,
    accountId,
    account,
    setAccountData,
    setProfileData
  ]);

  // Determine which account to display (viewed or current)
  const displayAccount =
    viewingOtherProfile && viewedAccount ? viewedAccount : account;

  if (displayAccount?.type === 'company') {
    return <CompanyProfile previewMode={previewMode || viewingOtherProfile} />;
  }

  if (displayAccount?.type === 'individual') {
    return (
      <IndividualProfile previewMode={previewMode || viewingOtherProfile} />
    );
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
