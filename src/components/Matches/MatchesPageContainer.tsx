import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../context/UserContext';
import { IndividualProfileDataFullInit } from '../../components/SignUp/Individual/types';
import { CompanyMatchList } from './CompanyMatchList';
import { MatchesFilterBar } from './MatchesFilterBar';
import { TalentMatchList } from './TalentMatchList';

export const MatchesPageContainer = () => {
  const { account, profile } = useUserContext();
  const [accountType, setAccountType] = useState(null);
  const [profileData, setProfileData] =
    useState<IndividualProfileDataFullInit>();

  useEffect(() => {
    const accountData = account?.data;

    if (accountData) {
      setAccountType(accountData.type);
    }
  }, [account]);

  useEffect(() => {
    const getProfileData = profile.data;
    getProfileData && setProfileData(getProfileData);
  }, [profile]);

  return (
    <div className="flex gap-12 pt-3">
      <div className="flex-none">
        {accountType === 'individual' ? (
          <div>
            <h2>Role Options</h2>
            <p>
              <strong>Stage Role:</strong>{' '}
              {profileData?.stage_role !== 'both-stage'
                ? profileData?.stage_role
                : 'All Roles'}
              <br />
              <strong>Ethnicites</strong>{' '}
              {profileData?.ethnicities.join(', ') || 'All Ethnicities'}
              <br />
              <strong>Age Ranges</strong>{' '}
              {profileData?.age_ranges.join(', ') || 'All Age Ranges'}
              <br />
              <strong>Gender Identity</strong>{' '}
              {profileData?.gender_identity || 'Any'}
            </p>
          </div>
        ) : (
          <MatchesFilterBar />
        )}
      </div>
      <div className="flex-1">
        {accountType === 'individual' ? (
          <CompanyMatchList />
        ) : (
          <TalentMatchList />
        )}
      </div>
    </div>
  );
};
