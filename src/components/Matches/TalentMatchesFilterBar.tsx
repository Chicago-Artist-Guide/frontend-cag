import React, { useEffect, useState } from 'react';
import { MatchingFilters } from './types';
import { Role } from '../Profile/Company/types';
import Dropdown from '../shared/Dropdown';
import { useMatches } from '../../context/MatchContext';

export const TalentMatchesFilterBar = () => {
  const { currentRoleId, filters, updateFilters, roles, setCurrentRoleId } =
    useMatches();
  const [currentRole, setCurrentRole] = useState<Role>();

  useEffect(() => {
    const getCurrentRole = roles?.find((r) => r.role_id === currentRoleId);

    if (getCurrentRole) {
      setCurrentRole(getCurrentRole);
    }
  }, [currentRoleId]);

  const roleOptions = roles?.map((r) => ({
    name: r.role_name || '',
    value: r.role_id || ''
  }));

  const unionStatusOptions = [
    {
      name: 'All Options',
      value: ''
    },
    {
      name: 'Yes',
      value: 'Yes'
    },
    {
      name: 'No',
      value: 'No'
    }
  ];

  const existingMatchOptions = [
    {
      name: 'All Matches',
      value: ''
    },
    {
      name: 'Approved',
      value: 'true'
    },
    {
      name: 'Declined',
      value: 'false'
    }
  ];

  const updateUnionStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unionStatusValue = e.target.value === '' ? undefined : e.target.value;
    updateFilters({ union_status: unionStatusValue } as MatchingFilters);
  };

  const updateMatchStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const matchStatusValue =
      e.target.value === ''
        ? undefined
        : e.target.value === 'true'
          ? true
          : false;
    updateFilters({ matchStatus: matchStatusValue } as MatchingFilters);
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-6 font-open-sans text-xl font-bold tracking-[0.5px] lg:text-2xl">
        Filter {filters.type === 'individual' ? 'Talent' : 'Roles'}
      </h2>
      {roles?.length && (
        <>
          {roleOptions?.length && (
            <Dropdown
              name="roleId"
              label="Role Name"
              options={roleOptions}
              value={currentRoleId}
              onChange={(e) =>
                setCurrentRoleId && setCurrentRoleId(e.target.value)
              }
            />
          )}

          {currentRole && (
            <div className="mt-6 space-y-5 border-t border-stone-200 pt-6">
              <div className="space-y-3.5">
                <div className="flex flex-nowrap items-center justify-between gap-4">
                  <span className="flex-shrink-0 font-open-sans text-sm font-medium tracking-[0.5px] text-stone-600">
                    Role Status
                  </span>
                  <span className="min-w-0 flex-1 text-right font-open-sans text-sm font-semibold tracking-[0.5px] text-dark">
                    {currentRole.role_status}
                  </span>
                </div>
                {currentRole.ethnicity && currentRole.ethnicity.length > 0 && (
                  <div className="flex flex-nowrap items-center justify-between gap-4">
                    <span className="flex-shrink-0 font-open-sans text-sm font-medium tracking-[0.5px] text-stone-600">
                      Ethnicity
                    </span>
                    <span className="min-w-0 flex-1 text-right font-open-sans text-sm font-semibold tracking-[0.5px] text-dark">
                      {currentRole.ethnicity.join(', ')}
                    </span>
                  </div>
                )}
                {currentRole.age_range && currentRole.age_range.length > 0 && (
                  <div className="flex flex-nowrap items-center justify-between gap-4">
                    <span className="flex-shrink-0 font-open-sans text-sm font-medium tracking-[0.5px] text-stone-600">
                      Age Range
                    </span>
                    <span className="min-w-0 flex-1 text-right font-open-sans text-sm font-semibold tracking-[0.5px] text-dark">
                      {currentRole.age_range.join(', ')}
                    </span>
                  </div>
                )}
                {currentRole.gender_identity &&
                  currentRole.gender_identity.length > 0 && (
                    <div className="flex flex-nowrap items-center justify-between gap-4">
                      <span className="flex-shrink-0 font-open-sans text-sm font-medium tracking-[0.5px] text-stone-600">
                        Gender
                      </span>
                      <span className="min-w-0 flex-1 text-right font-open-sans text-sm font-semibold tracking-[0.5px] text-dark">
                        {currentRole.gender_identity.join(', ')}
                      </span>
                    </div>
                  )}
                <div className="flex flex-nowrap items-center justify-between gap-4">
                  <span className="flex-shrink-0 font-open-sans text-sm font-medium tracking-[0.5px] text-stone-600">
                    LGBTQ+
                  </span>
                  <span className="min-w-0 flex-1 text-right font-open-sans text-sm font-semibold tracking-[0.5px] text-dark">
                    {currentRole.lgbtq_only ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              {currentRole.additional_requirements &&
                currentRole.additional_requirements.length > 0 && (
                  <div className="border-t border-stone-200 pt-4">
                    <div className="mb-2 font-open-sans text-sm font-semibold tracking-[0.5px] text-dark">
                      Special Requirements
                    </div>
                    <div className="font-open-sans text-sm font-normal tracking-[0.5px] text-stone-700">
                      {currentRole.additional_requirements.join(', ')}
                    </div>
                  </div>
                )}
            </div>
          )}

          <Dropdown
            name="unionStatus"
            label="Union Status"
            options={unionStatusOptions}
            value={''}
            onChange={updateUnionStatus}
          />
          <Dropdown
            name="existingMatches"
            label="Match Status"
            options={existingMatchOptions}
            value={''}
            onChange={updateMatchStatus}
          />
        </>
      )}
    </div>
  );
};
