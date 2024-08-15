import React, { useEffect, useState } from 'react';
import { MatchingFilters } from '../../components/Matches/types';
import { Role } from '../../components/Profile/Company/types';
import { skillCheckboxes } from '../../components/SignUp/Individual/types';
import { useMatches } from '../../context/MatchContext';
import Dropdown from '../../genericComponents/Dropdown';

export const MatchesFilterBar = () => {
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
    <div className="bg-white p-4 max-w-md">
      <h2 className="font-open-sans font-bold text-2xl tracking-[0.5px]">
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
            <div className="grid grid-cols-3 gap-3 pt-3 font-normal text-md tracking-[0.5px] font-open-sans text-dark">
              Role Status
              <span className="font-bold col-span-2">
                {currentRole.role_status}
              </span>
              {currentRole.ethnicity && (
                <>
                  Ethnicity
                  <span className="font-bold col-span-2">
                    {currentRole.ethnicity?.join(', ')}
                  </span>
                </>
              )}
              {currentRole.age_range && (
                <>
                  Age Range
                  <span className="font-bold col-span-2">
                    {currentRole.age_range?.join('; ')}
                  </span>
                </>
              )}
              {currentRole.age_range && (
                <>
                  Gender
                  <span className="font-bold col-span-2">
                    {currentRole.gender_identity?.join(', ')}
                  </span>
                </>
              )}
              <span className="col-span-3">LGBTQ+</span>
              {currentRole.additional_requirements && (
                <span className="font-bold col-span-3">
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
