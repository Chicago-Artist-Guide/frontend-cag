import React, { useEffect, useState } from 'react';
import { useMatches } from '../../context/MatchContext';
import Dropdown from '../../genericComponents/Dropdown';
import { Role } from '../../components/Profile/Company/types';

export const MatchesFilterBar = () => {
  const { currentRoleId, filters, roles } = useMatches();
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
              onChange={() => null}
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
        </>
      )}
    </div>
  );
};
