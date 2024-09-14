import React, { useEffect, useState } from 'react';
import { MatchingFilters } from './types';
import { Role } from '../Profile/Company/types';
import Dropdown from '../shared/Dropdown';
import { skillCheckboxes } from '../SignUp/Individual/types';
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

  const skillOptions = [
    {
      name: 'All Skills',
      value: ''
    },
    ...skillCheckboxes.map((s) => ({
      name: s,
      value: s
    }))
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

  const updateSkills = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skillValue = e.target.value === '' ? undefined : e.target.value;
    updateFilters({
      additional_skills_checkboxes: skillValue ? [skillValue] : undefined
    } as MatchingFilters);
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
    <div className="max-w-md bg-white p-4">
      <h2 className="font-open-sans text-2xl font-bold tracking-[0.5px]">
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
            <div className="text-md grid grid-cols-3 gap-3 pt-3 font-open-sans font-normal tracking-[0.5px] text-dark">
              Role Status
              <span className="col-span-2 font-bold">
                {currentRole.role_status}
              </span>
              {currentRole.ethnicity && (
                <>
                  Ethnicity
                  <span className="col-span-2 font-bold">
                    {currentRole.ethnicity?.join(', ')}
                  </span>
                </>
              )}
              {currentRole.age_range && (
                <>
                  Age Range
                  <span className="col-span-2 font-bold">
                    {currentRole.age_range?.join('; ')}
                  </span>
                </>
              )}
              {currentRole.age_range && (
                <>
                  Gender
                  <span className="col-span-2 font-bold">
                    {currentRole.gender_identity?.join(', ')}
                  </span>
                </>
              )}
              <span className="col-span-3">LGBTQ+</span>
              {currentRole.additional_requirements && (
                <span className="col-span-3 font-bold">
                  {currentRole.additional_requirements?.join(', ')}
                </span>
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
            name="skills"
            label="Special Skills"
            options={skillOptions}
            value={''}
            onChange={updateSkills}
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
