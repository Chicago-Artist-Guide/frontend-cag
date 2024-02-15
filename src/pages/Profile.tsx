import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import CompanyProfile from '../components/Profile/Company';
import IndividualProfile from '../components/Profile/Individual';
import { useProfileContext } from '../context/ProfileContext';

const Profile: React.FC<{
  previewMode?: boolean;
}> = ({ previewMode = false }) => {
  const history = useHistory();
  const auth = getAuth();
  const {
    account: { ref: accountRef, data: account },
    setAccountData,
    profile: { ref: profileRef },
    setProfileData
  } = useProfileContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        history.push('/login');
      }
    });

    getProfileData();
  }, [accountRef, profileRef]);

  const getProfileData = async () => {
    if (!profileRef || !accountRef) {
      return;
    }

    const profileData = await getDoc(profileRef);
    const accountData = await getDoc(accountRef);

    setProfileData(profileData.data());
    setAccountData(accountData.data());
    setLoading(false);
  };

  if (loading) {
    return <div>Loading</div>;
  }

  if (account?.type === 'company') {
    return <CompanyProfile previewMode={previewMode} />;
  }

  if (account?.type === 'individual') {
    return <IndividualProfile previewMode={previewMode} />;
  }

  return <div>No Profile</div>;
};

export default Profile;
