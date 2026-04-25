import React from 'react';
import clsx from 'clsx';
import { useRoleMatches } from '../../context/RoleMatchContext';
import { TalentMatchStatus } from './types';

const matchStatusOptions: {
  value: TalentMatchStatus;
  label: string;
}[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'favorite', label: 'Favorite' },
  { value: 'undecided', label: 'Undecided' }
];

export const RoleMatchesFilterBar = () => {
  const { filters, updateFilters } = useRoleMatches();
  const selected = filters.matchStatus || [];

  const toggle = (status: TalentMatchStatus, checked: boolean) => {
    const next = checked
      ? [...selected, status]
      : selected.filter((s) => s !== status);
    updateFilters({ matchStatus: next.length > 0 ? next : undefined });
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-6 font-open-sans text-xl font-bold tracking-[0.5px] lg:text-2xl">
        Filter Roles
      </h2>
      <div className="mb-3 font-open-sans text-sm font-semibold tracking-[0.5px] text-dark">
        Match Status
      </div>
      <div className="flex flex-col gap-2">
        {matchStatusOptions.map(({ value, label }) => {
          const checked = selected.includes(value);
          return (
            <label
              key={`role-filter-${value}`}
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
                onChange={(e) => toggle(value, e.target.checked)}
              />
              {label}
            </label>
          );
        })}
      </div>
    </div>
  );
};
