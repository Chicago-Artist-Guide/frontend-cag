import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { MatchingFilters, TheaterMatchStatus } from './types';
import { Role } from '../Profile/Company/types';
import Dropdown from '../shared/Dropdown';
import { useMatches } from '../../context/MatchContext';
import {
  unionOptionLabels,
  unionOptions,
  roleStatuses
} from '../../utils/lookups';
import { getOptions } from '../../utils/helpers';
import { RoleStatus } from '../Profile/shared/profile.types';
import ConfirmDialog from '../ConfirmDialog';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { useUserContext } from '../../context/UserContext';
import { updateRoleStatus } from '../Profile/Company/api';
import { sendRoleCloseDeclineNotifications } from './declineNotifications';

const roleStatusOptions = getOptions(roleStatuses);

const matchStatusOptions: {
  value: TheaterMatchStatus;
  label: string;
}[] = [
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'interested', label: 'Interested' },
  { value: 'favorite', label: 'Favorite' },
  { value: 'undecided', label: 'Undecided' }
];

const CLOSE_ROLE_CONFIRM_CONTENT =
  'By closing this role, you will automatically send a decline message to any artist who Applied and who you Declined.';

export const TalentMatchesFilterBar = () => {
  const {
    currentRoleId,
    filters,
    updateFilters,
    roles,
    setCurrentRoleId,
    production,
    setProduction,
    setRoles
  } = useMatches();
  const { firebaseFirestore } = useFirebaseContext();
  const {
    account,
    profile: { data: profileData }
  } = useUserContext();
  const [currentRole, setCurrentRole] = useState<Role>();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isClosingRole, setIsClosingRole] = useState(false);

  useEffect(() => {
    const getCurrentRole = roles?.find((r) => r.role_id === currentRoleId);

    if (getCurrentRole) {
      setCurrentRole(getCurrentRole);
    }
  }, [currentRoleId, roles]);

  const roleOptions = roles?.map((r) => ({
    name: r.role_name || '',
    value: r.role_id || ''
  }));

  const selectedUnions = filters.union_status || [];
  const selectedMatchStatuses = filters.matchStatus || [];
  const theaterAccountId = account?.id || '';
  const theaterName =
    profileData?.theatre_name || account?.data?.theater_name || '';

  const toggleUnion = (option: string, checked: boolean) => {
    const next = checked
      ? [...selectedUnions, option]
      : selectedUnions.filter((u) => u !== option);
    updateFilters({
      union_status: next.length > 0 ? next : undefined
    } as MatchingFilters);
  };

  const toggleMatchStatus = (status: TheaterMatchStatus, checked: boolean) => {
    const next = checked
      ? [...selectedMatchStatuses, status]
      : selectedMatchStatuses.filter((s) => s !== status);
    updateFilters({
      matchStatus: next.length > 0 ? next : undefined
    } as MatchingFilters);
  };

  const applyRoleStatus = async (roleStatus: RoleStatus) => {
    if (!production || !currentRoleId || !roles) {
      return;
    }

    const updatedRoles = await updateRoleStatus(
      firebaseFirestore,
      production.production_id,
      currentRoleId,
      roleStatus,
      roles
    );

    setRoles?.(updatedRoles);
    setProduction?.({ ...production, roles: updatedRoles });
  };

  const handleRoleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as RoleStatus;

    if (newStatus === 'Closed' && currentRole?.role_status !== 'Closed') {
      setShowCloseConfirm(true);
      return;
    }

    await applyRoleStatus(newStatus);
  };

  const handleCloseRoleCancel = () => {
    setShowCloseConfirm(false);
  };

  const handleCloseRoleConfirm = async () => {
    if (!production || !currentRoleId || !roles) {
      return;
    }

    setIsClosingRole(true);

    try {
      const updatedRoles = await updateRoleStatus(
        firebaseFirestore,
        production.production_id,
        currentRoleId,
        'Closed',
        roles
      );
      const updatedProduction = { ...production, roles: updatedRoles };

      setRoles?.(updatedRoles);
      setProduction?.(updatedProduction);

      await sendRoleCloseDeclineNotifications(
        firebaseFirestore,
        updatedProduction,
        currentRoleId,
        theaterAccountId,
        theaterName
      );
    } catch (error) {
      console.error('Error closing role:', error);
    } finally {
      setIsClosingRole(false);
      setShowCloseConfirm(false);
    }
  };

  return (
    <>
      <ConfirmDialog
        title="Close role"
        content={CLOSE_ROLE_CONFIRM_CONTENT}
        confirmLabel="Close"
        cancelLabel="Cancel"
        onCancel={handleCloseRoleCancel}
        onConfirm={handleCloseRoleConfirm}
        show={showCloseConfirm && !isClosingRole}
      />
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
                <Dropdown
                  name="role_status"
                  label="Role Status"
                  options={roleStatusOptions}
                  value={currentRole.role_status || 'Open'}
                  onChange={handleRoleStatusChange}
                />
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

            <div className="mt-6 border-t border-stone-200 pt-6">
              <div className="mb-3 font-open-sans text-sm font-semibold tracking-[0.5px] text-dark">
                Union Status
              </div>
              <div className="flex flex-col gap-2">
                {unionOptions.map((option) => {
                  const checked = selectedUnions.includes(option);
                  return (
                    <label
                      key={`filter-union-${option}`}
                      className={clsx(
                        'flex cursor-pointer items-center gap-2 font-open-sans text-sm tracking-[0.5px]',
                        {
                          'text-dark': checked,
                          'text-stone-700': !checked
                        }
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleUnion(option, e.target.checked)}
                      />
                      {unionOptionLabels[option]}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-stone-200 pt-6">
              <div className="mb-3 font-open-sans text-sm font-semibold tracking-[0.5px] text-dark">
                Match Status
              </div>
              <div className="flex flex-col gap-2">
                {matchStatusOptions.map(({ value, label }) => {
                  const checked = selectedMatchStatuses.includes(value);
                  return (
                    <label
                      key={`filter-match-status-${value}`}
                      className={clsx(
                        'flex cursor-pointer items-center gap-2 font-open-sans text-sm tracking-[0.5px]',
                        {
                          'text-dark': checked,
                          'text-stone-700': !checked
                        }
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          toggleMatchStatus(value, e.target.checked)
                        }
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
