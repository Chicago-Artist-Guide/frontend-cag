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
    <div className="w-full max-w-md bg-white p-4">
      <h2 className="font-open-sans text-xl font-bold tracking-[0.5px] lg:text-2xl">
        Role Options
      </h2>
      <div className="text-md grid grid-cols-1 gap-3 pt-3 font-open-sans font-normal tracking-[0.5px] text-dark sm:grid-cols-3">
        <div className="sm:col-span-1">Stage Role</div>
        <span className="col-span-1 font-bold sm:col-span-2">
          {profileData?.stage_role !== 'both-stage'
            ? profileData?.stage_role
            : 'All Roles'}
        </span>
        <div className="sm:col-span-1">Union Status</div>
        <span className="col-span-1 font-bold sm:col-span-2">
          {profileData?.union_status && profileData.union_status.length > 0
            ? profileData.union_status.join(', ')
            : 'All Options'}
        </span>
      </div>
    </div>
  );
};
