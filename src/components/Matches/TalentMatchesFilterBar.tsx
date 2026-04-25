import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { MatchingFilters, TheaterMatchStatus } from './types';
import { Role } from '../Profile/Company/types';
import Dropdown from '../shared/Dropdown';
import { useMatches } from '../../context/MatchContext';
import { unionOptionLabels, unionOptions } from '../../utils/lookups';

const matchStatusOptions: {
  value: TheaterMatchStatus;
  label: string;
}[] = [
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'interested', label: 'Interested' },
  { value: 'undecided', label: 'Undecided' }
];

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

  const selectedUnions = filters.union_status || [];
  const selectedMatchStatuses = filters.matchStatus || [];

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
  );
};
