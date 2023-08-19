import { uuidv4 } from '@firebase/util';
import React, { useState } from 'react';
import { SetForm } from 'react-hooks-helper';
import { StageRole } from '../../../shared/profile.types';
import { Production, Role } from '../../types';
import RoleCard from '../Roles/RoleCard';
import RoleModal from '../Roles/RoleModal';
import RoleSection from '../Roles/RoleSection';

const ManageProductionRoles: React.FC<{
  formValues: Production;
  setFormValues: SetForm;
  handleUpdate: (x: Production) => void;
}> = ({ formValues, setFormValues, handleUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [roleType, setRoleType] = useState<StageRole>('On-Stage');
  const [editRole, setEditRole] = useState<Role>();
  const currentRoles = formValues.roles || [];

  const onSaveRole = (role: Role) => {
    if (!role.role_name) {
      setEditRole(undefined);
      setShowModal(false);
      return;
    }

    let nextRoles: Role[];

    if (role.role_id) {
      nextRoles = currentRoles.map((r) => {
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
        name: 'roles',
        value: nextRoles
      }
    });

    setEditRole(undefined);
    setShowModal(false);
    handleUpdate({ ...formValues, roles: nextRoles });
  };

  const onManageOnStageRole = (role: Role = {}) => {
    setEditRole(role);
    setRoleType('On-Stage');
    setShowModal(true);
  };

  const onManageOffStageRole = (role: Role = {}) => {
    setEditRole(role);
    setRoleType('Off-Stage');
    setShowModal(true);
  };

  const { onStageRoles, offStageRoles } = currentRoles.reduce(
    (acc, role) => {
      if (role.type === 'On-Stage') {
        acc.onStageRoles.push(role);
      } else if (role.type === 'Off-Stage') {
        acc.offStageRoles.push(role);
      }
      return acc;
    },
    { onStageRoles: [] as Role[], offStageRoles: [] as Role[] }
  );

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
          {onStageRoles?.map((role) => (
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
            {offStageRoles?.map((role) => (
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
