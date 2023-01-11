import { uuidv4 } from '@firebase/util';
import React, { useState } from 'react';
import { SetForm } from 'react-hooks-helper';
import { Production, Role } from '../../types';
import RoleCard from '../Roles/RoleCard';
import RoleModal from '../Roles/RoleModal';
import RoleSection from '../Roles/RoleSection';

const ManageProductionRoles: React.FC<{
  formValues: Production;
  setFormValues: SetForm;
}> = ({ formValues, setFormValues }) => {
  const [showModal, setShowModal] = useState(false);
  const [roleType, setRoleType] = useState<'on-stage' | 'off-stage'>(
    'on-stage'
  );
  const [editRole, setEditRole] = useState<Role>();

  const onSaveRole = (role: Role) => {
    if (!role.role_name) {
      setEditRole(undefined);
      setShowModal(false);
      return;
    }

    let currentRoles =
      roleType === 'on-stage'
        ? formValues.onStageRoles
        : formValues.offStageRoles;
    let nextRoles: Role[];

    if (!currentRoles) {
      currentRoles = [];
    }

    if (role.role_id) {
      nextRoles = currentRoles.map(r => {
        if (r.role_id === role.role_id) {
          return role;
        }
        return r;
      });
    } else {
      role.role_id = uuidv4();
      nextRoles = [...currentRoles, role];
    }
    setFormValues({
      target: {
        name: roleType === 'on-stage' ? 'onStageRoles' : 'offStageRoles',
        value: nextRoles
      }
    });
    setEditRole(undefined);
    setShowModal(false);
  };

  const onManageOnStageRole = (role: Role = {}) => {
    setEditRole(role);
    setRoleType('on-stage');
    setShowModal(true);
  };

  const onManageOffStageRole = (role: Role = {}) => {
    setEditRole(role);
    setRoleType('off-stage');
    setShowModal(true);
  };

  return (
    <>
      <RoleModal
        show={showModal}
        type={roleType}
        role={editRole}
        onSubmit={onSaveRole}
        onClose={() => setShowModal(false)}
      />
      <div className="d-flex flex-column w-100" style={{ gap: '7.5em' }}>
        <RoleSection title="On-Stage" onClick={() => onManageOnStageRole()}>
          {formValues.onStageRoles?.map(role => (
            <RoleCard
              key={role.role_id}
              role={role}
              onEdit={() => onManageOnStageRole(role)}
              onViewMatches={() => alert('matches')}
            />
          ))}
        </RoleSection>
        <div className="mt-45">
          <RoleSection title="Off-Stage" onClick={() => onManageOffStageRole()}>
            {formValues.offStageRoles?.map(role => (
              <RoleCard
                key={role.role_id}
                role={role}
                onEdit={() => onManageOffStageRole(role)}
                onViewMatches={() => alert('matches')}
              />
            ))}
          </RoleSection>
        </div>
      </div>
    </>
  );
};

export default ManageProductionRoles;
