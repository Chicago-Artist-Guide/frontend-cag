import React from 'react';
import { Col } from 'react-bootstrap';
import { Production, Role } from '../../types';
import RoleCard from '../Roles/RoleCard';
import RoleSection from '../Roles/RoleSection';

const ManageProductionRoles: React.FC<{
  formValues: Production;
  setFormValues: any;
}> = ({ formValues, setFormValues }) => {
  return (
    <div className="d-flex flex-column w-100" style={{ gap: '7.5em' }}>
      <RoleSection title="On-Stage">
        <RoleCard
          role={{ role_name: 'Satine', role_status: 'Open' } as Role}
          onEdit={() => alert('hi')}
          onViewMatches={() => alert('hi')}
        />
        <RoleCard
          role={{ role_name: 'Satine', role_status: 'Open' } as Role}
          onEdit={() => alert('hi')}
          onViewMatches={() => alert('hi')}
        />
      </RoleSection>
      <div className="mt-45">
        <RoleSection title="Off-Stage">
          <RoleCard
            role={{ role_name: 'Satine', role_status: 'Open' } as Role}
            onEdit={() => alert('hi')}
            onViewMatches={() => alert('hi')}
          />
          <RoleCard
            role={{ role_name: 'Satine', role_status: 'Open' } as Role}
            onEdit={() => alert('hi')}
            onViewMatches={() => alert('hi')}
          />
        </RoleSection>
      </div>
    </div>
  );
};

export default ManageProductionRoles;
