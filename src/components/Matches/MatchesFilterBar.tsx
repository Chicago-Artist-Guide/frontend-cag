import React, { useEffect, useState } from 'react';
import { useMatches } from '../../context/MatchContext';
import Dropdown from '../../genericComponents/Dropdown';
import { Role } from '../../components/Profile/Company/types';
import { MatchingFilters } from '../../components/Matches/types';

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

  const updateUnionStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unionStatusValue = e.target.value === '' ? undefined : e.target.value;
    updateFilters({ union_status: unionStatusValue } as MatchingFilters);
  };

  return (
    <div>
      <h2>Filter {filters.type === 'individual' ? 'Talent' : 'Roles'}</h2>
      {roles?.length && (
        <>
          {roleOptions?.length && (
            <Dropdown
              name="roleId"
              label="Select Role"
              options={roleOptions}
              value={currentRoleId}
              onChange={(e) =>
                setCurrentRoleId && setCurrentRoleId(e.target.value)
              }
            />
          )}
          {currentRole && (
            <>
              Role Status <strong>{currentRole.role_status}</strong>
              <br />
              Ethnicity <strong>{currentRole.ethnicity?.join(', ')}</strong>
              <br />
              Age Range <strong>{currentRole.age_range?.join('; ')}</strong>
              <br />
              Gender <strong>{currentRole.gender_identity?.join(', ')}</strong>
              <br />
              LGBTQ+{' '}
              <strong>{currentRole.additional_requirements?.join(', ')}</strong>
            </>
          )}
          <hr />
          Union Status
          <Dropdown
            name="unionStatus"
            label="Select Role"
            options={unionStatusOptions}
            value={''}
            onChange={updateUnionStatus}
          />
          <br />
          Special Skills
        </>
      )}
    </div>
  );
};
