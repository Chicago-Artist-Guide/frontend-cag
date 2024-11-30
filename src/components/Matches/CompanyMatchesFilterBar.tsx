import React, { useEffect, useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import { IndividualProfileDataFullInit } from '../SignUp/Individual/types';

export const CompanyMatchesFilterBar = () => {
  const { profile } = useUserContext();
  const [profileData, setProfileData] =
    useState<IndividualProfileDataFullInit>();

  useEffect(() => {
    const getProfileData = profile.data;
    getProfileData && setProfileData(getProfileData);
  }, [profile]);

  return (
    <div className="max-w-md bg-white p-4">
      <h2 className="font-open-sans text-2xl font-bold tracking-[0.5px]">
        Role Options
      </h2>
      <div className="text-md grid grid-cols-3 gap-3 pt-3 font-open-sans font-normal tracking-[0.5px] text-dark">
        Stage Role
        <span className="col-span-2 font-bold">
          {profileData?.stage_role !== 'both-stage'
            ? profileData?.stage_role
            : 'All Roles'}
        </span>
        Ethnicites
        <span className="col-span-2 font-bold">
          {profileData?.ethnicities?.join(', ') || 'All Ethnicities'}
        </span>
        Age Ranges
        <span className="col-span-2 font-bold">
          {profileData?.age_ranges?.join(', ') || 'All Age Ranges'}
        </span>
        Gender Identity
        <span className="col-span-2 font-bold">
          {profileData?.gender_identity || 'Any'}
        </span>
      </div>
    </div>
  );
};
